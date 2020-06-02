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

const MATCH_URL_TWITCH_VIDEO = /(?:www\.|go\.)?twitch\.tv\/videos\/(\d+)($|\?)/
const MATCH_URL_TWITCH_CHANNEL = /(?:www\.|go\.)?twitch\.tv\/([a-zA-Z0-9_]+)($|\?)/
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
let addPopupURL = ( id, idIFrame, player, pos, ry = 0 ) =>{
	let div = document.createElement('div');
	div.style.fontFamily = "'Roboto', sans-serif";
	div.id = id + '-container';

	let button = document.createElement('button');
	button.style.fontSize = '20px';
	button.style.borderRadius = '10px';
	button.style.padding = '5px';
	button.style.border = 'none';
	button.style.background = '#81f1ff';
	button.innerHTML = 'Insert URL';

	button.addEventListener('click', function (params) {
		let url = prompt("Please enter " + player + " URL:", "");
		let cont = document.getElementById( id + '-container' );
		if (url == null || url == "") {
			// let war = document.createElement('p');
			// war.innerHTML = "Insert valid youtube url";
			// war.id = 'war';
			// cont.appendChild( war );
			console.log('WORK');
			
		} else 
		{
			if (document.getElementById('error')) 
			{
				document.getElementById('error').remove();
			}
			console.log(url);
			
			let embedURL;
			switch (player) {
				case 'youtube':
					embedURL = getEmbedYT(url);
					
					break;
				case 'twitch':
					embedURL = getEmbedTwitch(url);
					
					break;
				
				default:
					embedURL = null;
					break;
			}
			if (embedURL) {
				let iframeVideo = document.getElementById( idIFrame );
				iframeVideo.src = embedURL;
			}else{
				// let error = document.createElement('p');
				// error.innerHTML = "Insert valid " + player + " url";
				// error.style.color = 'red';
				// error.id = 'error';
				// cont.appendChild( error );
				alert("Insert valid " + player + " url")
			}
		}
		
	})

	div.appendChild( button );
	let object = new CSS3DObject( div );
	object.position.set( pos.x, pos.y, pos.z );
	object.rotation.y = ry;

	config.sceneCSS.add(object);
}
let addInput = ( id, pos, ry = 0, width = 480, height = 40 ) => {
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
		let embedURL = id == 'youtubeURL' ? getEmbedYT(url) : getEmbedTwitch(url);
		if (embedURL) {
			let iframeVideo = document.getElementById(id);
			iframeVideo.src = embedURL;
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

let addIFrame = ( src, id, pos, ry, width = 1080, height = 620 ) => {

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

let getEmbedTwitch = (url) => {
	//https://player.twitch.tv/?<channel, video, or collection>&parent=streamernews.example.com
	const isChannel = MATCH_URL_TWITCH_CHANNEL.test(url)
	const isVideo = MATCH_URL_TWITCH_VIDEO.test(url)
	if (isVideo) {
		let id = url.match(MATCH_URL_TWITCH_VIDEO)[1]
		let embedURL = 'https://player.twitch.tv/?video=' + id ;
		return embedURL;
	}
	else if (isChannel) {
		let id = url.match(MATCH_URL_TWITCH_CHANNEL)[1]
		let embedURL = 'https://player.twitch.tv/?channel=' + id ;
		return embedURL;
	}
	else{
		return null;
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
	
	// create a WebGLRenderer
	config.rendererGL = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    config.rendererGL.setClearColor( 0x000000, 0 );
    config.rendererGL.setPixelRatio( window.devicePixelRatio );
    config.rendererGL.setSize( window.innerWidth, window.innerHeight );
    config.rendererGL.shadowMap.enabled = true;
	config.rendererGL.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
	config.rendererGL.domElement.style.zIndex = "1";
	document.getElementById('gl').appendChild(config.rendererGL.domElement);


	// position and point the config.camera to the center of the scene
	config.camera.position.x = 0;
	config.camera.position.y = 0;
	config.camera.position.z = 1300;
	// config.camera.up = new THREE.Vector3(0,0,1);
	// config.camera.lookAt(scene.position);
	
	let url= 'https://www.youtube.com/watch?v=drTyVcMHy_k';
	
	addIFrame( getEmbedYT(url), 'youtube', new Vector3( 600, 200, 0 ), 0 );
	
	addIFrame( getEmbedTwitch('https://www.twitch.tv/tfue'), 'twitch', new Vector3( -600, 200, 0 ), 0 );
	
	// addInput( 'youtubeURL', new Vector3( 0, 250, 0 ), 0 );
	addPopupURL( 'youtubeURL', 'youtube', 'youtube', new Vector3( 600, -130, 0 ), 0 );
	addPopupURL( 'twitchURL', 'twitch', 'twitch', new Vector3( -600, -130, 0 ), 0 );
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
	// let pointLight = new THREE.PointLight(0xffffff);
	// pointLight.position.set(0, 300, 100);
	// config.sceneGL.add(pointLight);
	// let helperPointLight = new THREE.PointLightHelper(pointLight);
	// config.sceneGL.add(helperPointLight);
	let geometry = new THREE.BoxGeometry( 100, 100, 100 );
	let material = new THREE.MeshStandardMaterial({
		color: 0x00ffff,
		specular: 0x050505,
		shininess: 50,
		emissive: 0x000000
	});
	let cube = new THREE.Mesh( geometry, material );
	cube.position.set(0,200, 500);
	cube.rotation.x = -Math.PI / 3;
	config.sceneGL.add( cube );
	let floorTexture = new THREE.ImageUtils.loadTexture( 'assets/checkerboard.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 35, 35 );
	let floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	let floorGeometry = new THREE.PlaneGeometry(3500, 3500, 35, 35);
	let TeleportFloor = new THREE.Mesh(floorGeometry, floorMaterial);
	TeleportFloor.position.y = 450;
	TeleportFloor.rotation.x = -Math.PI / 3;
	TeleportFloor.name = 'TeleportFloor';
	config.sceneGL.add(TeleportFloor);
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
	// if (config.camera.position.z < 2200 && !renderCSS3D) {
	// 	console.log(config.camera.position);
	// 	renderCSS3D = true;
	// 	document.getElementById('css3d').style.display = 'block' ;
	// 	// document.getElementById('gl').style.pointerEvents = 'none';
	// 	config.rendererGL.setClearColor( 0x000000, 0);
	// } 
	// if(config.camera.position.z >= 2200 && renderCSS3D){
	// 	console.log(config.camera.position);
	// 	renderCSS3D = false;
	// 	// document.getElementById('css3d').style.display =  'none';
	// 	document.getElementById('gl').style.pointerEvents =  'all';
	// 	config.rendererGL.setClearColor( 0x000000,.5 );
	// }

}

init();
animate();