import './style.css'

const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()

const gain = ctx.createGain()
gain.gain.value = 0.02

gain.connect(ctx.destination)

const KEYBOARD_KEYS = [
    "a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j", "k", "o", "l", "p", "ö"
];

const PIANO_SIZE = KEYBOARD_KEYS.length

const BLACK_KEYS = [1, 3, 6, 8, 10];

const isBlack = (n: number) => {
    return BLACK_KEYS.includes(n % 12);
}

const makeKey = () => {
    const key = document.createElement("button")
    key.classList.add("key")
    return key
}

const makePiano = (cb: (i: number, enabled: boolean) => void) => {
    const piano = document.createElement("div")
    piano.classList.add("piano")

    const blackKeys = document.createElement("div")
    blackKeys.classList.add("black")

    const whiteKeys = document.createElement("div")
    whiteKeys.classList.add("white")


    for (const i of Array.from({ length: PIANO_SIZE }, (_, i) => i)) {
        const key = makeKey()
        key.textContent = KEYBOARD_KEYS[i]

        isBlack(i) ? blackKeys.appendChild(key) : whiteKeys.appendChild(key)

        const onCb = () => {
            key.classList.add("active");
            cb(i, true)
        }

        const offCb = () => {
            key.classList.remove("active");
            cb(i, false)
        }

        window.addEventListener("keydown", e => !e.repeat && e.key === KEYBOARD_KEYS[i] && onCb())
        window.addEventListener("keyup", e => !e.repeat && e.key === KEYBOARD_KEYS[i] && offCb())

        key.addEventListener('click', () => {
            onCb()
            setTimeout(offCb, 500)
        })
    }

    piano.appendChild(blackKeys)
    piano.appendChild(whiteKeys)

    return piano
}

const app = document.getElementById("app")!

const halfStepsToFrequency = (steps: number): number => {
    return 440 * Math.pow(2, steps / 12)
}

const oscillators = new Map<number, OscillatorNode>()

const piano = makePiano((i, enabled) => {
    const stop = () => {
        const oscillator = oscillators.get(i)
        oscillators.delete(i)
        oscillator?.stop(ctx.currentTime)
    }

    const start = () => {
        const frequency = halfStepsToFrequency(i)
        const oscillator = ctx.createOscillator()
        oscillators.set(i, oscillator)
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
        oscillator.type = "sawtooth"
        oscillator.start(ctx.currentTime)
        oscillator.connect(gain)
    }

    stop()
    if (enabled) {
        start()
    }
})

app.appendChild(piano)
