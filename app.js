var audioContext;
var gumStream;
var input;
var gain = null;
var analyser = null;
var processor = null;

var startButton = document.getElementById("startButton");
var stopButton = document.getElementById("stopButton");

//add events to those 2 buttons
startButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);

function startRecording() {
	var constraints = {
		audio: {
			echoCancellation: true,
			autoGainControl: false,
			noiseSuppression: false,
		},
		video: false }

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		audioContext = new window.AudioContext();
		gumStream = stream;
		input = audioContext.createMediaStreamSource(stream);

		gain = audioContext.createGain();
		gain.gain.value = 1;
		input.connect(gain);

		const numChannels = 2;
		const bufferSize = document.getElementById("bufsize").value;

		processor = audioContext.createScriptProcessor(bufferSize, 2, 2);
		gain.connect(processor)
		processor.connect(audioContext.destination)

		if (document.getElementById("analyser").checked) {
			analyser = audioContext.createAnalyser();
			analyser.fftSize = 8192
			input.connect(analyser)
		}

		processor.onaudioprocess = function(event) {
			for (var ch = 0; ch < numChannels; ++ch) {
				let buffer = event.inputBuffer.getChannelData(ch);
				let outputBuffer = event.outputBuffer.getChannelData(ch);
				for (var sample = 0; sample < buffer.length; sample++)
					outputBuffer[sample] = buffer[sample]
			}
		}

	}).catch(function(err) {
		console.log(err)
		startButton.disabled = false;
		stopButton.disabled = true;
	});

	startButton.disabled = true;
	stopButton.disabled = false;
}

function stopRecording() {
	gumStream.getAudioTracks()[0].stop();

	if (analyser != null) {
		input.disconnect(analyser)
		analyser = null
	}

	input.disconnect()
	gain.disconnect()
	processor.disconnect()
	audioContext.close()

	gain = null
	input = null

	//disable the stop button
	stopButton.disabled = true;
	startButton.disabled = false;
}
