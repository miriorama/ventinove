var KAL = (function() {
    let kal = {
        canvas: null,
        ctx: null,
        rec: null,

        screenX: 0,
        screenY: 0,

        xAmount: 0,
        yAmount: 0,
        modeAmount: 0
    };

    let img;
    let pattern;
    const {PI,sin,cos} = Math;
    const PI2 = PI*2;
    const slices = 6;
    const mirror = true;
    let offset = {x: 0, y: 0};
    let patternStroke = "#41062e";

    let $log, $mode;

    kal.init = function() {
        kal.canvas = document.querySelector(".c");
        kal.canvas.width = 3000;
        kal.canvas.height = 3000;
        kal.ctx = kal.canvas.getContext("2d");
        kal.w = kal.canvas.width; // = window.innerWidth;
        kal.h = kal.canvas.height; // = window.innerHeight;
        kal.w2 = kal.w/2 , kal.h2 = kal.h/2;

        //img = new Image();
        //img.src = "img/cover.png";
        //img.onload = function() {
        //    pattern = kal.ctx.createPattern(img, 'repeat');
        //    KAL.loop();
        //};

        $log = document.querySelector('.log');
        $mode = document.querySelector('.mode');
    }

    kal.loop = function() {
        kal.ctx.clearRect(0,0,kal.w,kal.h);

        let radius = kal.w2 + kal.h2;
        let deltaAngle = PI2 / slices;

        let x = [ -1,
            -1/*radius * sin(0)*/,
            radius * sin(deltaAngle),
            radius * sin(deltaAngle/2)
        ];
        let y = [ -1,
            radius/*radius * cos(0)*/,
            radius * cos(deltaAngle),
            radius * cos(deltaAngle/2)
        ];

        for(let i=0; i<slices; i++) {

            // draw the damn thing
            kal.ctx.translate(kal.w2, kal.h2);
            kal.ctx.rotate(i * deltaAngle);
            kal.ctx.translate(offset.x, offset.y);
            kal.ctx.beginPath();
            kal.ctx.moveTo(x[0]-offset.x, y[0]-offset.y);
            kal.ctx.lineTo(x[1]-offset.x, y[1]-offset.y);
            kal.ctx.lineTo(x[2]-offset.x, y[2]-offset.y);
            kal.ctx.lineTo(x[0]-offset.x, y[0]-offset.y);
            kal.ctx.fillStyle = pattern;
            kal.ctx.fill();
            kal.ctx.resetTransform();

            if (mirror) {
                kal.ctx.translate(kal.w2, kal.h2);
                kal.ctx.rotate((i-1) * deltaAngle);
                kal.ctx.scale(-1, 1);
                kal.ctx.translate(offset.x, offset.y);

                kal.ctx.beginPath();
                kal.ctx.moveTo(x[0]-offset.x, y[0]-offset.y);
                kal.ctx.lineTo(x[1]-offset.x, y[1]-offset.y);
                kal.ctx.lineTo(x[3]-offset.x, y[3]-offset.y);
                kal.ctx.lineTo(x[0]-offset.x, y[0]-offset.y);
                kal.ctx.fillStyle = pattern;
                kal.ctx.fill();

                kal.ctx.resetTransform();
            }
        }

        const lerp = (x, y, a) => x * (1 - a) + y * a;
        const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));
        const invlerp = (x, y, a) => clamp((a - x) / (y - x));
        const range = (x1, y1, x2, y2, a) => lerp(x2, y2, invlerp(x1, y1, a));

        /*switch (kal.mode) {
            case 'up':
                kal.screenX += kal.modeAmount;
                break;
            case 'down':
                kal.screenX += kal.modeAmount;
            default:
                break;
        }*/
        //kal.screenX += kal.xAmount;
        //kal.screenY += kal.yAmount;

        let diffX = kal.screenX - offset.x;
        let diffY = kal.screenY - offset.y;
        //offset.x += diffX/50; //range(0, window.innerWidth, 0,1, diffX);
        //offset.y += diffY/50;

        //offset.x = 0;
        //offset.y = (offset.y + 0) % img.height;




        $log.innerHTML = offset.x + ' ' + offset.y;

        // loop
        requestAnimationFrame(KAL.loop);

        if(kal.capturer) {
            kal.capturer.capture(KAL.canvas);
        }
    }

    kal.easeInOutQuart = function(x) {
        return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
    }

    kal.drawDot = function(x, y, r=4, fillStyle="tomato") {
        kal.ctx.beginPath();
        kal.ctx.arc(x,y, r, 0, PI2);
        kal.ctx.fillStyle = fillStyle;
        kal.ctx.fill();
    }

    kal.rotate = function(x, y, a) {
        let newx = x*cos(a) - y*sin(a);
        let newy = x*sin(a) + y*cos(a);
        x = newx;
        y = newy;
        return {x, y};
    }

    kal.reset = function() {
        offset.x = 0;
        offset.y = 0;
    }

    kal.startRecording = function() {
        kal.capturer = new CCapture({
            format: 'webm',
            framerate: 60,
            //quality: 1
        });
        kal.capturer.start();
        /*const chunks = []; // here we will store our recorded media chunks (Blobs)
        const stream = kal.canvas.captureStream(); // grab our canvas MediaStream

        var options = {
            audioBitsPerSecond : 128000,
            videoBitsPerSecond : 1002500000,
            mimeType: 'video/webm;codecs=h264'
        }

        kal.rec = new MediaRecorder(stream, options); // init the recorder

        // every time the recorder has new data, we will store it in our array
        kal.rec.ondataavailable = e => chunks.push(e.data);

        // only when the recorder stops, we construct a complete Blob from all the chunks
        kal.rec.onstop = e => KAL.exportVideo(new Blob(chunks, {type: 'video/webm'}));

        kal.rec.start();*/
    }

    kal.stopRecording = function() {
        kal.capturer.stop();
        kal.capturer.save();
        //kal.rec.stop();
    }

    kal.exportVideo = function(blob) {
        const vid = document.createElement('video');
        vid.src = URL.createObjectURL(blob);
        vid.controls = true;

        let $bar = document.querySelector('.bar');
        $bar.appendChild(vid);

        const a = document.createElement('a');
        a.download = 'myvid.webm';
        a.href = vid.src;
        a.textContent = 'download the video';
        $bar.appendChild(a);
    }

    kal.onResize = function() {
        //w = kal.canvas.width = window.innerWidth;
        //h = kal.canvas.height = window.innerHeight;
        //w2 = w/2;
        //h2 = h/2;
    }

    kal.onMouseMove = function(e) {
        //kal.screenX = e.clientX; //offset.x;
       // kal.screenY = e.clientY; //offset.x;

        console.log(e.clientX,e.clientY);

        offset.x = e.clientX * img.width*2 / window.innerWidth;
	    offset.y = e.clientY * img.height*2 / window.innerHeight;
    }

    kal.onKeyPress = function(event) {
        console.log(event.key);
        let previousMode = KAL.mode;

        if (event.key == 8) {
           // giù

           KAL.mode = 'up';
           kal.yAmount++; //-= (previousMode === KAL.mode ? KAL.modeAmount+1 : 0);
        } else if(event.key == 2) {
            // su
            KAL.mode = 'down';
            kal.yAmount--; // = (previousMode === KAL.mode ? KAL.modeAmount-1 : 0);
        } else if(event.key == 5) {
            kal.xAmount = 0; // = (previousMode === KAL.mode ? KAL.modeAmount-1 : 0);
            kal.yAmount = 0; // = (previousMode === KAL.mode ? KAL.modeAmount-1 : 0);
        } else if(event.key == 4) {
            kal.xAmount--;
        } else if(event.key == 6) {
            kal.xAmount++;
        }



        $mode.innerHTML = `xAmount: ${kal.xAmount} yAmount: ${kal.yAmount} `;
    }

    return kal;
})();

KAL.init();

window.onresize = function() {
    KAL.onResize();
};
window.onmousemove = function(e) {
    KAL.onMouseMove(e);
}

window.onkeypress = function(event) {
    KAL.onKeyPress(event);
 }