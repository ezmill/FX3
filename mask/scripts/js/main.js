var container;
var scene, camera, light, renderer;
var renderSize = new THREE.Vector2(window.innerWidth, 2500*(window.innerWidth/3750));
// var renderSize = new THREE.Vector2(window.innerWidth*0.25, 2500*(window.innerWidth*0.25/3750));
// var renderSize = new THREE.Vector2(3750, 2500);
var mouse = new THREE.Vector2(0.0,0.0);
var mouseDown = false;
var r2 = 0.0;
var time = 0.0;
var mask;
var origTex;
var effect;
// var effects = [
// 	"oil paint",
// 	"edge detect",
// 	"revert",
// 	"rgb shift",
// 	"warp"
// ], effectIndex = 0;
var texture;
var fbMaterial;
var origTex = THREE.ImageUtils.loadTexture("assets/textures/test.jpg");
origTex.minFilter = origTex.magFilter = THREE.LinearFilter;
init();
function init(){
	scene = new THREE.Scene();

    camera = new THREE.OrthographicCamera( renderSize.x / - 2, renderSize.x / 2, renderSize.y / 2, renderSize.y / - 2, -10000, 10000 );
    camera.position.set(0,0,0);

	renderer = new THREE.WebGLRenderer({preserveDrawingBuffer:true});
	renderer.setSize( renderSize.x, renderSize.y );
	renderer.setClearColor(0xffffff,1.0);

	container = document.getElementById( 'container' );
	// container.appendChild(renderer.domElement);

	createEffect();
	container.appendChild(mask.renderer.domElement);

	document.addEventListener("mousemove", onMouseMove);
	document.addEventListener("mousedown", onMouseDown);
	document.addEventListener("mouseup", onMouseUp);
	document.addEventListener("keydown", onKeyDown);
	animate();

}
function createEffect(){
	mask = new Mask();
	mask.init();
}	

function animate(){
	window.requestAnimationFrame(animate);
	draw();
}

function onMouseMove(event){

	mouse.x = ( event.pageX / renderSize.x ) * 2 - 1;
    mouse.y = - ( event.pageY / renderSize.y ) * 2 + 1;
	// mask.material.uniforms["mouse"].value = new THREE.Vector2(event.pageX, renderSize.y - event.pageY);	
	mask.material.uniforms["mouse"].value = mouse;	
}
function onMouseDown(){
	mouseDown = true;
}
function onMouseUp(){
	mouseDown = false;
	r2 = 0;
}
function draw(){
	time+= 0.01;
	if(mouseDown){
		r2 = 0.5;
	}
	mask.update();
	renderer.render(scene, camera);
}
function onKeyDown(e){
	if(e.keyCode == '32'){
		e.preventDefault();
		var blob = dataURItoBlob(renderer.domElement.toDataURL('image/jpg'));
	    var file = window.URL.createObjectURL(blob);
	    var img = new Image();
	    img.src = file;
        img.onload = function(e) {
            window.open(this.src);
        }
	}
}
function dataURItoBlob(dataURI) {
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {
        type: mimeString
    });
}