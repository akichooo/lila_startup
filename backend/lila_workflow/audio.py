from __future__ import annotations

import ipaddress
import math
import socket
import tempfile
from functools import lru_cache
from pathlib import Path
from urllib.parse import urlparse

import numpy as np
import requests

from .models import TranscriptChunk
from .settings import Settings


LOCAL_HOSTNAMES = {"localhost", "localhost.localdomain"}


def _host_is_private(hostname: str) -> bool:
    if hostname.lower() in LOCAL_HOSTNAMES:
        return True
    try:
        ip = ipaddress.ip_address(hostname)
        return ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast
    except ValueError:
        pass

    try:
        infos = socket.getaddrinfo(hostname, None)
    except socket.gaierror:
        return False

    for info in infos:
        address = info[4][0]
        try:
            ip = ipaddress.ip_address(address)
        except ValueError:
            continue
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast:
            return True
    return False


def download_audio_url(audio_url: str, target_dir: Path, settings: Settings) -> Path:
    parsed = urlparse(audio_url)
    if parsed.scheme not in {"http", "https"}:
        raise ValueError("audio_url must use http or https")
    if not parsed.hostname:
        raise ValueError("audio_url is missing a hostname")
    if _host_is_private(parsed.hostname) and not settings.allow_local_audio_urls:
        raise ValueError("audio_url points to a private host; set LILA_ALLOW_LOCAL_AUDIO_URLS=true for local tests")

    suffix = Path(parsed.path).suffix.lower()
    if suffix not in {".wav", ".mp3", ".m4a", ".mp4", ".webm", ".ogg", ".flac", ".aac"}:
        suffix = ".audio"

    response = requests.get(audio_url, stream=True, timeout=settings.request_timeout_sec)
    response.raise_for_status()

    content_length = response.headers.get("content-length")
    if content_length and int(content_length) > settings.max_audio_bytes:
        raise ValueError("audio file exceeds configured size limit")

    output = target_dir / f"audio{suffix}"
    written = 0
    with output.open("wb") as fh:
        for chunk in response.iter_content(chunk_size=1024 * 1024):
            if not chunk:
                continue
            written += len(chunk)
            if written > settings.max_audio_bytes:
                raise ValueError("audio file exceeds configured size limit")
            fh.write(chunk)

    if written == 0:
        raise ValueError("audio download returned an empty file")
    return output


@lru_cache(maxsize=2)
def _load_whisper_model(model_name: str, device: str, compute_type: str):
    from faster_whisper import WhisperModel

    return WhisperModel(model_name, device=device, compute_type=compute_type)


def transcribe_audio(audio_path: Path, settings: Settings) -> tuple[list[TranscriptChunk], float]:
    if settings.transcription_mode == "fixture":
        chunks = [
            TranscriptChunk(0.0, 1.8, "I think the robot should help people share turns."),
            TranscriptChunk(2.3, 4.1, "What do you mean by fair in this story?"),
            TranscriptChunk(4.6, 6.8, "Fair means everyone gets a chance to explain their idea."),
            TranscriptChunk(7.4, 9.0, "Can I add one more example?"),
            TranscriptChunk(9.4, 11.8, "The bridge worked because they listened before choosing."),
        ]
        return chunks, 11.8

    model = _load_whisper_model(settings.whisper_model, settings.whisper_device, settings.whisper_compute_type)
    segments, info = model.transcribe(
        str(audio_path),
        beam_size=1,
        vad_filter=True,
        word_timestamps=True,
        condition_on_previous_text=False,
    )

    chunks: list[TranscriptChunk] = []
    for segment in segments:
        words = list(getattr(segment, "words", None) or [])
        if words:
            chunks.extend(_chunks_from_words(words, settings.silence_gap_sec))
        else:
            text = (getattr(segment, "text", "") or "").strip()
            if text:
                chunks.append(
                    TranscriptChunk(
                        start=float(getattr(segment, "start", 0.0) or 0.0),
                        end=float(getattr(segment, "end", 0.0) or 0.0),
                        text=text,
                    )
                )

    chunks = [chunk for chunk in chunks if chunk.text.strip() and chunk.end > chunk.start]
    chunks.sort(key=lambda item: (item.start, item.end))
    duration = float(getattr(info, "duration", 0.0) or (chunks[-1].end if chunks else 0.0))
    return chunks, duration


def _chunks_from_words(words: list[object], gap_sec: float) -> list[TranscriptChunk]:
    chunks: list[TranscriptChunk] = []
    current_words: list[str] = []
    current_start: float | None = None
    current_end: float | None = None

    for word in words:
        text = (getattr(word, "word", "") or "").strip()
        start = float(getattr(word, "start", 0.0) or 0.0)
        end = float(getattr(word, "end", start) or start)
        if not text or end <= start:
            continue
        gap = start - current_end if current_end is not None else 0.0
        if current_words and gap > gap_sec:
            chunks.append(TranscriptChunk(current_start or 0.0, current_end or start, " ".join(current_words).strip()))
            current_words = []
            current_start = None
        if current_start is None:
            current_start = start
        current_end = end
        current_words.append(text)

    if current_words:
        chunks.append(TranscriptChunk(current_start or 0.0, current_end or current_start or 0.0, " ".join(current_words).strip()))
    return chunks


def load_mono_audio(audio_path: Path, target_sample_rate: int = 16000) -> tuple[np.ndarray, int]:
    try:
        return _load_wav(audio_path, target_sample_rate)
    except Exception:
        return _load_with_pyav(audio_path, target_sample_rate)


def _load_wav(audio_path: Path, target_sample_rate: int) -> tuple[np.ndarray, int]:
    import wave

    with wave.open(str(audio_path), "rb") as wav:
        channels = wav.getnchannels()
        sample_width = wav.getsampwidth()
        sample_rate = wav.getframerate()
        frames = wav.readframes(wav.getnframes())

    if sample_width == 1:
        data = (np.frombuffer(frames, dtype=np.uint8).astype(np.float32) - 128.0) / 128.0
    elif sample_width == 2:
        data = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0
    elif sample_width == 4:
        data = np.frombuffer(frames, dtype=np.int32).astype(np.float32) / 2147483648.0
    else:
        raise ValueError("unsupported WAV sample width")

    if channels > 1:
        data = data.reshape(-1, channels).mean(axis=1)
    return _resample(data, sample_rate, target_sample_rate), target_sample_rate


def _load_with_pyav(audio_path: Path, target_sample_rate: int) -> tuple[np.ndarray, int]:
    import av

    container = av.open(str(audio_path))
    resampler = av.audio.resampler.AudioResampler(format="s16", layout="mono", rate=target_sample_rate)
    chunks: list[np.ndarray] = []
    for frame in container.decode(audio=0):
        for resampled in resampler.resample(frame):
            arr = resampled.to_ndarray().reshape(-1).astype(np.float32) / 32768.0
            chunks.append(arr)
    for resampled in resampler.resample(None):
        chunks.append(resampled.to_ndarray().reshape(-1).astype(np.float32) / 32768.0)
    if not chunks:
        return np.zeros(0, dtype=np.float32), target_sample_rate
    return np.concatenate(chunks), target_sample_rate


def _resample(data: np.ndarray, sample_rate: int, target_sample_rate: int) -> np.ndarray:
    if sample_rate == target_sample_rate or data.size == 0:
        return data.astype(np.float32)
    duration = data.size / float(sample_rate)
    target_size = max(1, int(duration * target_sample_rate))
    source_x = np.linspace(0.0, duration, num=data.size, endpoint=False)
    target_x = np.linspace(0.0, duration, num=target_size, endpoint=False)
    return np.interp(target_x, source_x, data).astype(np.float32)


def enrich_with_audio_features(chunks: list[TranscriptChunk], samples: np.ndarray, sample_rate: int) -> None:
    for chunk in chunks:
        start = max(0, int(chunk.start * sample_rate))
        end = min(samples.size, int(chunk.end * sample_rate))
        window = samples[start:end]
        if window.size == 0:
            chunk.energy = 0.0
            chunk.pitch_hz = 0.0
            continue
        chunk.energy = float(np.sqrt(np.mean(np.square(window))))
        chunk.pitch_hz = _estimate_pitch(window, sample_rate)


def _estimate_pitch(window: np.ndarray, sample_rate: int) -> float:
    if window.size < sample_rate * 0.04:
        return 0.0
    energy = float(np.sqrt(np.mean(np.square(window))))
    if energy < 0.008:
        return 0.0

    max_samples = min(window.size, int(sample_rate * 0.75))
    signal = window[:max_samples].astype(np.float32)
    signal = signal - np.mean(signal)
    if not np.any(signal):
        return 0.0

    corr = np.correlate(signal, signal, mode="full")[signal.size - 1 :]
    min_lag = max(1, int(sample_rate / 420.0))
    max_lag = min(corr.size - 1, int(sample_rate / 75.0))
    if max_lag <= min_lag:
        return 0.0
    lag = int(np.argmax(corr[min_lag:max_lag]) + min_lag)
    confidence = corr[lag] / (corr[0] + 1e-9)
    if confidence < 0.2:
        return 0.0
    return round(float(sample_rate / lag), 2)


def assign_speakers(chunks: list[TranscriptChunk], speaker_count: int) -> list[str]:
    speaker_count = max(1, speaker_count)
    labels = [f"Speaker {i}" for i in range(1, speaker_count + 1)]
    if not chunks:
        return labels

    cluster_count = min(speaker_count, len(chunks))
    features = np.array(
        [
            [
                math.log1p(max(0.0, chunk.pitch_hz)),
                math.log1p(max(0.0, chunk.energy * 100.0)),
                (chunk.start + chunk.end) / 2.0,
            ]
            for chunk in chunks
        ],
        dtype=np.float32,
    )
    features = _standardize(features)
    assignments = _kmeans(features, cluster_count)

    first_start_by_cluster: dict[int, float] = {}
    for assignment, chunk in zip(assignments, chunks):
        first_start_by_cluster[assignment] = min(first_start_by_cluster.get(assignment, chunk.start), chunk.start)
    cluster_order = {
        cluster: index
        for index, cluster in enumerate(sorted(first_start_by_cluster.keys(), key=lambda key: first_start_by_cluster[key]))
    }

    for assignment, chunk in zip(assignments, chunks):
        label_index = cluster_order.get(assignment, 0)
        chunk.speaker_label = labels[label_index]
    return labels


def _standardize(features: np.ndarray) -> np.ndarray:
    if features.size == 0:
        return features
    mean = features.mean(axis=0)
    std = features.std(axis=0)
    std[std < 1e-6] = 1.0
    return (features - mean) / std


def _kmeans(features: np.ndarray, cluster_count: int, iterations: int = 30) -> list[int]:
    if features.shape[0] == 0:
        return []
    if cluster_count <= 1:
        return [0 for _ in range(features.shape[0])]

    seed_indices = np.linspace(0, features.shape[0] - 1, num=cluster_count, dtype=int)
    centers = features[seed_indices].copy()
    assignments = np.zeros(features.shape[0], dtype=int)

    for _ in range(iterations):
        distances = np.linalg.norm(features[:, None, :] - centers[None, :, :], axis=2)
        next_assignments = np.argmin(distances, axis=1)
        if np.array_equal(assignments, next_assignments):
            break
        assignments = next_assignments
        for cluster in range(cluster_count):
            members = features[assignments == cluster]
            if members.size:
                centers[cluster] = members.mean(axis=0)
    return assignments.tolist()


def merge_adjacent_turns(chunks: list[TranscriptChunk], gap_sec: float) -> list[TranscriptChunk]:
    if not chunks:
        return []
    sorted_chunks = sorted(chunks, key=lambda item: (item.start, item.end))
    merged: list[TranscriptChunk] = []
    current = sorted_chunks[0]

    for chunk in sorted_chunks[1:]:
        if chunk.speaker_label == current.speaker_label and chunk.start - current.end <= gap_sec:
            current.end = max(current.end, chunk.end)
            current.text = f"{current.text} {chunk.text}".strip()
            current.energy = max(current.energy, chunk.energy)
            if current.pitch_hz <= 0.0:
                current.pitch_hz = chunk.pitch_hz
        else:
            merged.append(current)
            current = chunk
    merged.append(current)
    return merged


def temporary_audio_dir():
    return tempfile.TemporaryDirectory(prefix="lila-audio-")
