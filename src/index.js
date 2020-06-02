//Dependencies Webpack  and threeJS, npm install webpack webpack-cli, npm install threeJS
// npm run-script build to compile, work on this file.
// dont change package.json


//Llamada de la librerias
const THREE = require('three');
// CommonJS:
const dat = require('dat.gui');
const Stats = require('stats.js');

//controles orbitales
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject, CSS3DSprite } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

import { Vector3, BufferGeometryLoader } from 'three';

import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

const MATCH_URL_YOUTUBE = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})|youtube\.com\/playlist\?list=|youtube\.com\/user\//
let config ={};
let rendererCSS, sceneCSS, camera;
let sceneGL, rendererGL;
let keyboard = new THREEx.KeyboardState();
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let raycaster;	
let renderCSS3D = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let mouse = new THREE.Vector2();

let controls;

let addInput = ( id, pos, ry = 0, width = 480, height = 80 ) => {
	let div = document.createElement( 'div' );
	div.style.width = width + 'px';
	div.style.height = height + 'px';
	div.style.backgroundColor = '#000';
	div.style.fontFamily = "'Roboto', sans-serif";
	div.id = id + '-container';

	let input = document.createElement('INPUT');
	input.setAttribute("type", "text");
	input.setAttribute("placeholder", "Insert youtube URL");
	input.id = id + '-input';
	input.style.width = '80%';
	input.style.marginRight = '5px';
	input.addEventListener('click', function (params) {
		input.focus();
		config.controls.enabled = false;
		
	})
	input.addEventListener('focusout', function (params) {
		config.controls.enabled = true;
		
	})
	let button = document.createElement('button');
	button.innerHTML = 'Show';
	button.addEventListener('click', function (params) {

		if (document.getElementById('error')) 
		{
			document.getElementById('error').remove();
		}
		let input = document.getElementById(id + '-input');
		let url = input.value;
		input.value = '';
		console.log(url);
		
		let cont = document.getElementById(id + '-container');
		let embedURL = getEmbedYT(url);
		if (embedURL) {
			let iframeYT = document.getElementById('youtube');
			iframeYT.src = embedURL;
		}else{
			let error = document.createElement('p');
			error.innerHTML = "Insert valid youtube url";
			error.style.color = 'red';
			error.id = 'error';
			cont.appendChild( error );

		}
		
	})

	div.appendChild( input );
	div.appendChild( button );

	
	let object = new CSS3DObject( div );
	object.position.set( pos.x, pos.y, pos.z );
	object.rotation.y = ry;

	config.sceneCSS.add(object);
};

let addIFrame = ( src, id, pos, ry, width = 480, height = 360 ) => {

	let div = document.createElement( 'div' );
	div.style.width = width + 'px';
	div.style.height = height + 'px';
	div.style.backgroundColor = '#000';

	let iframe = document.createElement( 'iframe' );
	iframe.style.width = width + 'px';
	iframe.style.height = height + 'px';
	iframe.style.border = '0px';
	iframe.src = src;
	iframe.allowFullscreen = true;
	iframe.id = id;
	div.appendChild( iframe );

	let object = new CSS3DObject( div );
	object.position.set( pos.x, pos.y, pos.z );
	object.rotation.y = ry;

	// return object;
	config.sceneCSS.add(object);
	// addPlane(object.position, object.rotation, width, height);

};


let addPlane = (position, rotation, width, height) =>{
	let material = new THREE.MeshPhongMaterial({
		opacity	: 0.2,
		color	: new THREE.Color('black'),
		blending: THREE.NoBlending,
		side	: THREE.DoubleSide,
	});
	let geometry = new THREE.PlaneGeometry( width, height );
	let mesh = new THREE.Mesh( geometry, material );
	mesh.position.copy( position );
	mesh.rotation.copy( rotation );
	//mesh.scale.copy( domObject.scale );
	mesh.castShadow = false;
	mesh.receiveShadow = true;
	config.sceneGL.add( mesh );
};

let getEmbedYT = (url) => {
	if (url.match(MATCH_URL_YOUTUBE) || url == '') {
		let id = url && url.match(MATCH_URL_YOUTUBE)[1];
		let embedURL = 'https://www.youtube.com/embed/' + id;
		return embedURL;
	}else{
		return null;
	}
}

var player;
var onKeyDown = function ( event ) {

	switch ( event.keyCode ) {

		case 38: // up
		case 87: // w
			moveForward = true;
			break;

		case 37: // left
		case 65: // a
			moveLeft = true;
			break;

		case 40: // down
		case 83: // s
			moveBackward = true;
			break;

		case 39: // right
		case 68: // d
			moveRight = true;
			break;

		case 32: // space
			if ( canJump === true ) velocity.y += 350;
			canJump = false;
			break;

	}

};

var onKeyUp = function ( event ) {

	switch ( event.keyCode ) {

		case 38: // up
		case 87: // w
			moveForward = false;
			break;

		case 37: // left
		case 65: // a
			moveLeft = false;
			break;

		case 40: // down
		case 83: // s
			moveBackward = false;
			break;

		case 39: // right
		case 68: // d
			moveRight = false;
			break;

	}

};
document.addEventListener( 'keydown', onKeyDown, false );
document.addEventListener( 'keyup', onKeyUp, false );

function raycast(e) {
	
    //1. sets the mouse position with a coordinate system where the center
    //   of the screen is the origin
    mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

    //2. set the picking ray from the camera position and mouse coordinates
    raycaster.setFromCamera( mouse, config.camera );    
	console.log('hey');
	
    //3. compute intersections
    var intersects = raycaster.intersectObjects( config.sceneGL.children );
	console.log(intersects);

    for ( var i = 0; i < intersects.length; i++ ) {
        console.log( intersects[ i ] ); 
        /*
            An intersection has the following properties :
                - object : intersected object (THREE.Mesh)
                - distance : distance from camera to intersection (number)
                - face : intersected face (THREE.Face3)
                - faceIndex : intersected face index (number)
                - point : intersection point (THREE.Vector3)
                - uv : intersection point in the object's UV coordinates (THREE.Vector2)
        */
    }

}

let init = () => {
	
	
	
	config.sceneCSS = new THREE.Scene();
	config.sceneGL = new THREE.Scene();

	config.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 2000 );
	config.camera2 = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 2000 );

	// create a CSS3DRenderer
	config.rendererCSS = new CSS3DRenderer();
	config.rendererCSS.setSize(window.innerWidth, window.innerHeight);
	config.rendererCSS.domElement.style.position = 'absolute';
    config.rendererCSS.domElement.style.top = 0;
	document.getElementById('css3d').appendChild(config.rendererCSS.domElement);
	// width: 100%;
	// height: 100%;
	// position: absolute;
	// top: 0; left: 0;

	// create a WebGLRenderer
	config.rendererGL = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    config.rendererGL.setClearColor( 0x000000, 0 );
    config.rendererGL.setPixelRatio( window.devicePixelRatio );
    config.rendererGL.setSize( window.innerWidth, window.innerHeight );
    config.rendererGL.shadowMap.enabled = true;
	config.rendererGL.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
	config.rendererGL.domElement.style.zIndex = "1";
	document.getElementById('gl').appendChild(config.rendererGL.domElement);
	// width: 100%;
	// height: 100%;
	// position: absolute;
	// top: 0; left: 0;
	// pointer-events:none

	raycaster = new THREE.Raycaster();
    config.rendererGL.domElement.addEventListener( 'click', raycast, false );


	// position and point the config.camera to the center of the scene
	config.camera.position.x = 0;
	config.camera.position.y = 0;
	config.camera.position.z = 1300;
	// config.camera.up = new THREE.Vector3(0,0,1);
	// config.camera.lookAt(scene.position);
	let asd= 'https://www.youtube.com/embed/U5vTlFp4Gew' +'?enablejsapi=1&origin=http://example.com'
	let url= 'https://www.youtube.com/watch?v=U5vTlFp4Gew';
	addIFrame( asd, 'youtube', new Vector3( 0, 0, 0 ), 0 );
	//https://player.twitch.tv/?<channel, video, or collection>&parent=streamernews.example.com
	addIFrame( 'https://player.twitch.tv/?channel=tfue&parent=streamernews.example.com&autoplay=false', 'twitch', new Vector3( -550, 0, 150 ), 45 * Math.PI / 180 );
	addIFrame( 'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Ffacebookapp%2Fvideos%2F10153231379946729%2F&show_text=0', 'facebook',  new Vector3( 550, 0, 150 ), -45 * Math.PI / 180 );
	// addIFrameYT('https://www.youtube.com/watch?v=U5vTlFp4Gew', new Vector3( 0, 0, 0 ), 0)
	
	addInput( 'urlVideo', new Vector3( 0, 250, 0 ), 0 );
	config.controls = new OrbitControls( config.camera, config.rendererCSS.domElement );
	// config.controlsGL = new OrbitControls( config.camera, config.rendererGL.domElement );
	// config.controls = new PointerLockControls( camera, document.body );
	// config.sceneGL.add( config.controls.getObject() );

	config.controls.keys = {
		LEFT: 65, //A
		UP: 87, // W
		RIGHT: 68, // D
		BOTTOM: 83 // S
	};
	// config.controlsGL.keys = config.controls.keys;
	// config.controls.enabled = false;

	let light = new THREE.AmbientLight(0xffffff);
	config.sceneGL.add(light);
	let pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(0, 300, 100);
	config.sceneGL.add(pointLight);
	let helperPointLight = new THREE.PointLightHelper(pointLight);
	config.sceneGL.add(helperPointLight);
	let geometry = new THREE.BoxGeometry( 100, 100, 100 );
	let material = new THREE.MeshStandardMaterial( {color: 0x00ff00} );
	let cube = new THREE.Mesh( geometry, material );
	cube.position.set(0,-100, 500);
	config.sceneGL.add( cube );

}

function displayWindowSize(){
	// Get width and height of the window excluding scrollbars
	var w = document.documentElement.clientWidth;
	var h = document.documentElement.clientHeight;
	
	// Display result inside a div element
	// console.log("Width: " + w + ", " + "Height: " + h);
	config.rendererGL.setSize(w, h);
	config.rendererCSS.setSize(w, h);
	// config.camera.fov = Math.atan(window.innerHeight / 2 / config.camera.position.z) * 2 * THREE.Math.RAD2DEG;
	config.camera.aspect = w / h;
	config.camera.updateProjectionMatrix();
}

// Attaching the event listener function to window's resize event
window.addEventListener("resize", displayWindowSize);

function animate() 
{
	requestAnimationFrame(animate);
	
	// // stats.update();	
	// config.sceneCSS.updateMatrixWorld()
	// config.sceneGL.updateMatrixWorld()
	
	config.controls.update();
	config.rendererCSS.render( config.sceneCSS, config.camera );
	config.rendererGL.render( config.sceneGL, config.camera );
	// if (renderCSS3D) {
		
	// }else{
	// 	config.controlsGL.update();
	// 	// config.rendererCSS.render( config.sceneCSS, config.camera );
	// 	config.rendererGL.render( config.sceneGL, config.camera );

	// }
	if (config.camera.position.z < 2200 && !renderCSS3D) {
		console.log(config.camera.position);
		renderCSS3D = true;
		document.getElementById('css3d').style.display = 'block' ;
		document.getElementById('gl').style.pointerEvents = 'none';
		config.rendererGL.setClearColor( 0x000000, 0);
	} 
	if(config.camera.position.z >= 2200 && renderCSS3D){
		console.log(config.camera.position);
		renderCSS3D = false;
		// document.getElementById('css3d').style.display =  'none';
		document.getElementById('gl').style.pointerEvents =  'all';
		config.rendererGL.setClearColor( 0x000000,.5 );
	}

}

init();
animate();