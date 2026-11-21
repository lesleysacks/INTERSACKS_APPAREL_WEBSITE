"""InterSacks promo soundtrack, synthesised from scratch (no samples).

A 60-second, 96 BPM boom-bap beat in A minor: kick, snare, hats, a sub-bass line
and a soft minor-chord pad, with a short intro and a fade-out to match the video.
Run: python3 beat.py out.wav
"""
import sys
import wave

import numpy as np

SR = 44100
LENGTH = 60.0
BPM = 96
BEAT = 60 / BPM
rng = np.random.default_rng(23)

t_total = int(SR * LENGTH)
mix = np.zeros(t_total)


def env(n, attack=0.002, decay=0.2):
    t = np.arange(n) / SR
    a = np.clip(t / attack, 0, 1)
    return a * np.exp(-t / decay)


def place(signal, start_s, gain=1.0):
    i = int(start_s * SR)
    if i >= t_total:
        return
    j = min(t_total, i + len(signal))
    mix[i:j] += signal[: j - i] * gain


def kick():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    freq = 50 + 110 * np.exp(-t * 28)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    click = rng.normal(0, 1, n) * np.exp(-t * 300) * 0.3
    return (np.sin(phase) * np.exp(-t * 6.5) + click) * 0.95


def snare():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    noise = rng.normal(0, 1, n)
    # Crude high-pass: difference of the noise.
    noise = np.append(noise[1:] - noise[:-1], 0) * 0.5
    tone = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 30)
    return (noise * np.exp(-t * 14) * 0.55 + tone * 0.5) * 0.8


def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR)
    t = np.arange(n) / SR
    noise = rng.normal(0, 1, n)
    noise = np.append(noise[1:] - noise[:-1], 0)
    noise = np.append(noise[1:] - noise[:-1], 0)
    return noise * np.exp(-t * (12 if open_ else 70)) * 0.09


def bass_note(freq, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 2 * t)
    return np.tanh(1.6 * s) * env(n, 0.01, dur * 0.9) * 0.42


def pad_chord(freqs, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        for detune in (-0.6, 0.6):
            s += np.sin(2 * np.pi * (f + detune) * t + rng.uniform(0, 6))
    swell = np.clip(t / 0.6, 0, 1) * np.clip((dur - t) / 0.8, 0, 1)
    return s / (len(freqs) * 2) * swell * 0.16


def note(name):
    names = {'A1': 55.0, 'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.0,
             'A3': 220.0, 'C4': 261.63, 'E4': 329.63, 'F3': 174.61, 'D4': 293.66, 'G3': 196.0, 'B3': 246.94}
    return names[name]


bar = BEAT * 4
chords = [['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['D4', 'F3', 'A3'], ['E4', 'G3', 'B3']]
bass_roots = ['A1', 'F2', 'D2', 'E2']
intro_bars = 1
bars = int(LENGTH / bar) + 1

for b in range(bars):
    start = b * bar
    chord = chords[b % 4]
    place(pad_chord([note(c) for c in chord], bar), start)
    if b < intro_bars:
        continue
    root = note(bass_roots[b % 4])
    # Bass: root on 1, octave pickup on the "and" of 2, root on 3.
    place(bass_note(root, BEAT * 1.4), start)
    place(bass_note(root * 2, BEAT * 0.4), start + BEAT * 1.5, 0.7)
    place(bass_note(root, BEAT * 1.2), start + BEAT * 2.5)
    # Drums: boom-bap pattern.
    for k in (0, 1.75, 2.5):
        place(kick(), start + k * BEAT)
    for s in (1, 3):
        place(snare(), start + s * BEAT)
    for h in range(8):
        place(hat(open_=(h == 7 and b % 2)), start + h * BEAT / 2, 1.0 if h % 2 == 0 else 0.6)

# Riser into the drop at 5 s and a gentle master fade.
n = int(1.2 * SR)
t = np.arange(n) / SR
riser = rng.normal(0, 1, n) * (t / t[-1]) ** 2 * 0.12
place(riser, bar * intro_bars - 1.2)

fade_in = np.clip(np.arange(t_total) / (SR * 0.5), 0, 1)
fade_out = np.clip((LENGTH - np.arange(t_total) / SR) / 3.0, 0, 1)
mix *= fade_in * fade_out
mix = np.tanh(mix * 1.1)
mix /= max(1e-9, np.max(np.abs(mix))) / 0.89

stereo = np.stack([mix, mix], axis=1)
out = sys.argv[1] if len(sys.argv) > 1 else 'beat.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype('<i2').tobytes())
print('wrote', out)
