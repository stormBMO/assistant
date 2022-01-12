import React, { createRef, useEffect, useRef, useState } from 'react'
import logo from './logo.svg'
import './App.css'

const HEIGHT = 600
const WIDTH = 600

const App = () => {
  const [source, setSource] = useState<MediaStreamAudioSourceNode | null>(null)
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const canvas = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (navigator.mediaDevices) {
      console.log('getUserMedia supported.')
      navigator.mediaDevices
        .getUserMedia({
          audio: true
        })
        .then(stream => {
          const audioCtxTemp = new window.AudioContext()
          setAnalyser(audioCtxTemp.createAnalyser())
          setAudioCtx(audioCtxTemp)
          setSource(audioCtxTemp.createMediaStreamSource(stream))
        })
        .catch(err => {
          console.log('The following gUM error occured: ' + err)
        })
    } else {
      console.log('getUserMedia not supported on your browser!')
    }
  }, [])

  useEffect(() => {
    if (source && analyser) {
      source.connect(analyser)
      visualize()
    }
  }, [source])

  const visualize = () => {
    if (analyser) {
      analyser.fftSize = 1024
      const bufferLength = analyser.fftSize
      const dataArray = new Uint8Array(bufferLength)

      const canvasCtx = (canvas.current as HTMLCanvasElement).getContext('2d')

      if (canvasCtx) {
        const draw = () => {
          canvasCtx.clearRect(0, 0, WIDTH, HEIGHT)
          analyser.getByteFrequencyData(dataArray)
          const barWidth = WIDTH / 2 / bufferLength
          let barHeight
          let x = 0

          for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i]
            canvasCtx.save()
            canvasCtx.translate(WIDTH / 2, HEIGHT / 2)
            canvasCtx.rotate(i + (Math.PI * 2) / bufferLength)
            const red = (i * barHeight) / 30
            const green = i / 2
            const blue = barHeight
            canvasCtx.fillStyle = 'white'
            canvasCtx.fillRect(0, 0, 0, 15)
            canvasCtx.fillStyle = 'rgba(119, 121, 177, 1)'
            canvasCtx.fillRect(0, 0, barWidth, barHeight)
            x += barWidth
            canvasCtx.restore()
          }
          requestAnimationFrame(draw)
        }
        draw()
      }
    }
  }

  return (
    <div className='App'>
      <canvas ref={canvas} height={HEIGHT + 'px'} width={WIDTH + 'px'}></canvas>
    </div>
  )
}

export default App
