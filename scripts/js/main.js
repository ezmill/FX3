var container;
var scene, camera, light, renderer;
var renderSize = new THREE.Vector2(window.innerWidth, 1440*(window.innerWidth/2560));
// var renderSize = new THREE.Vector2(window.innerWidth*0.25, 1440*(window.innerWidth*0.25/2560));
// var renderSize = new THREE.Vector2(2560, 1440);
var seed;
var mouse = new THREE.Vector2(0.0,0.0);
var mouseDown = false;
var r2 = 0.0;
var time = 0.0;
var mask;
var origTex;
var effect;
var liveMode = false;
var effects = [ "warp",
				// "color blur",
				"revert",
				"rgb shift",
				"oil paint",
				"median blur",
				"repos",
				"flow",
				"gradient",
				"warp flow",
				// "stained glass",
				"curves",
				"neon glow"
			]

// if()
// console.log(effects);
//to-do splice in BASE shader at first index and then remove after starting
var effectIndex = 0;
var texture;
var fbMaterial;
var origTex = THREE.ImageUtils.loadTexture("assets/textures/newtest.jpg");
origTex.minFilter = origTex.magFilter = THREE.LinearFilter;
var nextEffectsSelector = document.getElementById("nextEffectsSelector");
var currentEffectsSelector = document.getElementById("effectsSelector");
var liveModeSelector = document.getElementById("liveMode");
var liveModeContainer = document.getElementById("liveModeContainer");
var orderContainer = document.getElementById("order");
liveModeSelector.addEventListener("change", function(e){
	liveMode = !liveMode;
	if(liveMode){
		effectIndex = -1;
		shuffle(effects);
		// console.log("test");
		insertRevert(effects);
		// console.log(effects);
		printEffects(effects);
		createNewEffect(true);
	}
})
currentEffectsSelector.addEventListener("change", function(){
	liveModeSelector.checked = false;
	liveMode = false;
})
nextEffectsSelector.addEventListener("change", function(){
	liveModeSelector.checked = false;
	liveMode = false;
})
function printEffects(arr){
	while (orderContainer.hasChildNodes()) {
		// if(liveModeContainer.lastChild.tagName == "div"){
		    orderContainer.removeChild(orderContainer.lastChild);
		// }
	}
	for(var i = 0; i < arr.length; i++){
		var el = document.createElement("div");
		el.innerHTML = arr[i];
		orderContainer.appendChild(el);
	}
}
init();
function init(){
	scene = new THREE.Scene();

    camera = new THREE.OrthographicCamera( renderSize.x / - 2, renderSize.x / 2, renderSize.y / 2, renderSize.y / - 2, -10000, 10000 );
    camera.position.set(0,0,0);

	renderer = new THREE.WebGLRenderer({preserveDrawingBuffer:true});
	renderer.setSize( renderSize.x, renderSize.y );
	renderer.setClearColor(0xffffff,1.0);

	container = document.getElementById( 'container' );
	container.appendChild(renderer.domElement);

	createEffect();

	document.addEventListener("mousemove", onMouseMove);
	document.addEventListener("mousedown", onMouseDown);
	document.addEventListener("mouseup", onMouseUp);
	document.addEventListener("keydown", onKeyDown);
	animate();

}
function createEffect(){

	noise = THREE.ImageUtils.loadTexture("assets/textures/noise.png");
	noise.minFilter = noise.magFilter = THREE.LinearFilter;

	if(texture)texture.dispose();
	texture = THREE.ImageUtils.loadTexture("assets/textures/newtest.jpg");
	texture.minFilter = texture.magFilter = THREE.LinearFilter;

    effect = new Effect(currentEffectsSelector.options[currentEffectsSelector.selectedIndex].value);
    // effect = new Effect("revert");
    // effect = new Effect(effects[effectIndex]);
    effect.init();
    if(effect.useMask){
		mask = new Mask();
		mask.init();
		mask.update();
		alpha = new THREE.Texture(mask.renderer.domElement);
		alpha.minFilter = alpha.magFilter = THREE.LinearFilter;
		alpha.needsUpdate = true;
    } else {
		alpha = null;
    }
    if(fbMaterial)fbMaterial.dispose();
	fbMaterial = new FeedbackMaterial(renderer, scene, camera, texture, effect.shaders);  
    fbMaterial.init();
    // fbMaterial.scale(0.33333);
    for(var i = 0; i < fbMaterial.fbos.length; i++){
		if(fbMaterial.fbos[i].material.uniforms["id"])fbMaterial.fbos[i].material.uniforms["id"].value = effect.blendId;
	    	if(fbMaterial.fbos[i].material.uniforms["origTex"])fbMaterial.fbos[i].material.uniforms["origTex"].value = origTex;
		// if(fbMaterial.fbos[i].material.uniforms["origTex"])fbMaterial.fbos[i].material.uniforms["origTex"].value = origTex;
    	// if(fbMaterial.fbos[i].material.uniforms["id2"])fbMaterial.fbos[i].material.uniforms["id2"].value = effect.id2;
    }

    
}	
function createNewEffect(YN){
	var createNew = YN;
	if(liveMode){
		if(effectIndex == effects.length - 1){
			effectIndex = 0;
		} else {
			effectIndex++;
		}		
	}

    var blob = dataURItoBlob(renderer.domElement.toDataURL('image/jpg'));
    var file = window.URL.createObjectURL(blob);
    var img = new Image();
    img.src = file;
    img.onload = function(e) {
    	texture.dispose();
    	if(createNew){
			texture = THREE.ImageUtils.loadTexture("assets/textures/newtest.jpg");
			texture.minFilter = texture.magFilter = THREE.LinearFilter;
    	} else {
    		texture.image = img;    		
    	}

	    // effect = new Effect(effects[effectIndex]);
	    // effect = new Effect("warp flow");
	    if(liveMode){
		    effect = new Effect(effects[effectIndex]);
	    } else {
	    	effect = new Effect(nextEffectsSelector.options[nextEffectsSelector.selectedIndex].value);	    	
	    }
	    effect.init();
	    // currentEffectsSelector.options[currentEffectsSelector.selectedIndex].innerHTML = nextEffectsSelector.options[nextEffectsSelector.selectedIndex].innerHTML;
		if(effect.useMask){
			mask = new Mask();
			mask.init();
			mask.update();
			alpha = new THREE.Texture(mask.renderer.domElement);
			alpha.minFilter = alpha.magFilter = THREE.LinearFilter;
			alpha.needsUpdate = true;
		} else {
			alpha = null;
		}
		fbMaterial.dispose();

		fbMaterial = new FeedbackMaterial(renderer, scene, camera, texture, effect.shaders);			
	    fbMaterial.init();
	    for(var i = 0; i < fbMaterial.fbos.length; i++){
	    	if(fbMaterial.fbos[i].material.uniforms["id"])fbMaterial.fbos[i].material.uniforms["id"].value = effect.blendId;
	    	if(fbMaterial.fbos[i].material.uniforms["origTex"])fbMaterial.fbos[i].material.uniforms["origTex"].value = origTex;

	    	// if(fbMaterial.fbos[i].material.uniforms["id2"])fbMaterial.fbos[i].material.uniforms["id2"].value = Math.floor(Math.random()*25);
	    }
    }
}
function animate(){
	window.requestAnimationFrame(animate);
	draw();
}

function onMouseMove(event){
	mouse.x = ( event.pageX / renderSize.x ) * 2 - 1;
    mouse.y = - ( event.pageY / renderSize.y ) * 2 + 1;
    // if(effect.useMask){
    	// mask.mouse = new THREE.Vector2(event.pageX, event.pageY);		
    	mask.mouse = new THREE.Vector2(mouse.x, mouse.y);		
    // }
}
function onMouseDown(){
	mouseDown = true;
	for(var i = 0; i < fbMaterial.fbos.length; i++){
		// if(fbMaterial.fbos[i].material.uniforms["id"])fbMaterial.fbos[i].material.uniforms["id"].value = Math.floor(Math.random()*25);
		// if(fbMaterial.fbos[i].material.uniforms["id2"])fbMaterial.fbos[i].material.uniforms["id2"].value = Math.floor(Math.random()*25);
	}
}
function onMouseUp(){
	mouseDown = false;
	r2 = 0;
	// setTimeout(createNewEffect, 1000);
	if(liveMode){
		createNewEffect(false);
	}
}
function draw(){
	time += 0.01;
	if(mouseDown){
		r2 = 0.5;
	}

	if(effect.useMask){
		mask.update();
		alpha.needsUpdate = true;
	}
	fbMaterial.setUniforms();
    fbMaterial.update();
	renderer.render(scene, camera);
	fbMaterial.getNewFrame();
	fbMaterial.swapBuffers();
}
function onKeyDown(e){
	console.log(e);
	if(e.keyCode == '88'){
		// mask.switchColor();
		createNewEffect();
	}
	if(e.keyCode == '32'){
		e.preventDefault();
		// createNewEffect();
		// fbMaterial.scale(3.0);
		renderSize = new THREE.Vector2(2560, 1440);
		camera.left = renderSize.x / - 2;
		camera.right = renderSize.x / 2;
		camera.top = renderSize.y / 2;
		camera.bottom = renderSize.y / - 2;
		renderer.setSize( renderSize.x, renderSize.y );
		fbMaterial.setUniforms();
		fbMaterial.resize();
	    fbMaterial.update();
	    renderer.render(scene, camera);
	    fbMaterial.getNewFrame();
	    fbMaterial.swapBuffers();
		var blob = dataURItoBlob(renderer.domElement.toDataURL('image/jpg'));
	    var file = window.URL.createObjectURL(blob);
	    var img = new Image();
	    img.src = file;
        img.onload = function(e) {
            window.open(this.src);
        }
		renderSize = new THREE.Vector2(window.innerWidth, 1440*(window.innerWidth/2560));
		camera.left = renderSize.x / - 2;
		camera.right = renderSize.x / 2;
		camera.top = renderSize.y / 2;
		camera.bottom = renderSize.y / - 2;
		renderer.setSize( renderSize.x, renderSize.y );
		fbMaterial.setUniforms();
		fbMaterial.resize();
	    fbMaterial.update();
	    renderer.render(scene, camera);
	    fbMaterial.getNewFrame();
	    fbMaterial.swapBuffers();
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
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}
function insertRevert(array){
	var length = array.length;
	for(var i = 0; i < length; i++){
		if(array[i] == "revert"){
			array.splice(i, 1);
		}
	}
	for(var i = 0; i < length; i++){
		if(array[i] == "flow" || array[i] == "repos"){
			array.splice(i+1, 0, "revert");
		}
	}
}