imageUpload = document.getElementById('imageUpload')

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('models')
]).then(start)

async function start() {
    container = document.createElement('div')
    container.style.position = 'relative'
    document.body.append(container)
    const labeledFaceDescriptors = await loadLabeledImages()
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.4)
    let image
    let canvas
    document.body.style.backgroundColor = "pink";
    // imageUpload.value = "D:\Facial Recognition Based Attendance System\Sample Image For Testing.jpg";
    // document.body.append('Loaded')
    imageUpload.addEventListener('change', async() => {
        var InformationObject = [];
        if (image) image.remove()
        if (canvas) canvas.remove()

        image = await faceapi.bufferToImage(imageUpload.files[0])
        container.append(image)
        canvas = faceapi.createCanvasFromMedia(image)
        container.append(canvas)
        const displaySize = { width: image.width, height: image.height }
        faceapi.matchDimensions(canvas, displaySize)
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
        var NumberofStudents = 0;
        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box
            var Name = result.toString();
            Name = Name.split("(")[0].trim();
            let Unknowns = Name.includes("unknown");
            if (!Unknowns) {
                InformationObject[NumberofStudents++] = Name;
                // console.log(Name)
            }
            const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
            drawBox.draw(canvas)
        })

        var text = "";
        InformationObject.forEach(myFunction);
        console.log(InformationObject);

        function myFunction(item, index) {
            text += "||" + index + ": " + item + " || ";
        }
    })
}

function loadLabeledImages() {
    const labels = ['Mone', 'Thure', 'Wedne', 'Tuese', 'Sanjeev Arora']
    return Promise.all(
        labels.map(async label => {
            const descriptions = []
            const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/sanjeevarora3735/Facial-Recognition-Attendance-System/main/${label}/${label}.jpg`)
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                // console.log(detections.descriptor)
            descriptions.push(detections.descriptor)

            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}