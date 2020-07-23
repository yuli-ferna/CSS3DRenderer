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

import { Vector3 } from 'three';

const MATCH_URL_TWITCH_VIDEO = /(?:www\.|go\.)?twitch\.tv\/videos\/(\d+)($|\?)/
const MATCH_URL_TWITCH_CHANNEL = /(?:www\.|go\.)?twitch\.tv\/([a-zA-Z0-9_]+)($|\?)/
const MATCH_URL_YOUTUBE = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})|youtube\.com\/playlist\?list=|youtube\.com\/user\//
let config ={};
let player;

let getVideoIds = (url) => { 
	let ids = getEmbedTwitchIds(url);

	if (ids) {
		ids.name = 'twitch';
		return ids;
	}else if (MATCH_URL_YOUTUBE.test(url)) {
		ids = {};
		ids.name = 'youtube';
		ids.video = url.match(MATCH_URL_YOUTUBE)[1]
	}else {
		return null;
	}

	return ids;

}
let getEmbedTwitchIds = (url) => {
	//https://player.twitch.tv/?<channel, video, or collection>&parent=streamernews.example.com
	let ids = {channel: null, video: null}
	const isChannel = MATCH_URL_TWITCH_CHANNEL.test(url)
	const isVideo = MATCH_URL_TWITCH_VIDEO.test(url)
	if (isVideo) {
		ids.video = url.match(MATCH_URL_TWITCH_VIDEO)[1]
	}
	else if (isChannel) {
		ids.channel = url.match(MATCH_URL_TWITCH_CHANNEL)[1]
	}
	else{
		return null;
	}
	return ids;
}

let addPopupURLIFrame = ( id, idIFrame, player, pos, ry = 0 ) =>{
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

let addPopupURL = ( buttonOptions ) =>{
	let div = document.createElement('div');
	div.style.fontFamily = buttonOptions.fontFamily ? buttonOptions.fontFamily : "'Roboto', sans-serif";
	div.id = buttonOptions.id ? buttonOptions.id : 'popup-container';

	let button = document.createElement('button');
	button.style.fontSize = buttonOptions.fontSize ? buttonOptions.fontSize : '20px';
	button.style.borderRadius = buttonOptions.borderRadius ? buttonOptions.borderRadius : '10px';
	button.style.padding = buttonOptions.padding ? buttonOptions.padding : '5px';
	button.style.border = buttonOptions.border ? buttonOptions.border : 'none';
	button.style.background = buttonOptions.background ? buttonOptions.background : '#81f1ff';
	button.innerHTML = buttonOptions.innerHTML ? buttonOptions.innerHTML : 'Insert URL';

	button.addEventListener('click', function (params) {
		
		let url = prompt("Please enter " + "Youtube or Twitch" + " URL:", "");
		// let cont = document.getElementById( id + '-container' );
		if (url == null || url == "") {
			// let war = document.createElement('p');
			// war.innerHTML = "Insert valid youtube url";
			// war.id = 'war';
			// cont.appendChild( war );
			// console.log('WORK');
			
		} else 
		{
			if (document.getElementById('error')) 
			{
				document.getElementById('error').remove();
			}
			console.log(url);
			let ids = getVideoIds(url);
			switch (ids.name) {
				case 'youtube':
					console.log(player);
					player.videoId = ids.video;
					break;
				case 'twitch':
					
					if (ids.channel) {
						console.log(player);
						player.setChannel(ids.channel);
					}else if(ids.video) {
						player.setVideo(ids.video);
					}
					break;
				
				default:

					break;
			}
			if (!ids) {
				// let error = document.createElement('p');
				// error.innerHTML = "Insert valid " + player + " url";
				// error.style.color = 'red';
				// error.id = 'error';
				// cont.appendChild( error );
				alert("Insert valid " + buttonOptions.playerName + " url")
			}
		}
		
	})

	div.appendChild( button );
	let object = new CSS3DObject( div );
	object.position.set( buttonOptions.pos.x, buttonOptions.pos.y, buttonOptions.pos.z );
	object.rotation.y = buttonOptions.ry ? buttonOptions.ry : 0;

	config.sceneCSS.add(object);
}

let addPopupURLTwitch = ( buttonOptions ) =>{
	let div = document.createElement('div');
	div.style.fontFamily = buttonOptions.fontFamily ? buttonOptions.fontFamily : "'Roboto', sans-serif";
	div.id = buttonOptions.id ? buttonOptions.id : 'popup-container';

	let button = document.createElement('button');
	button.style.fontSize = buttonOptions.fontSize ? buttonOptions.fontSize : '20px';
	button.style.borderRadius = buttonOptions.borderRadius ? buttonOptions.borderRadius : '10px';
	button.style.padding = buttonOptions.padding ? buttonOptions.padding : '5px';
	button.style.border = buttonOptions.border ? buttonOptions.border : 'none';
	button.style.background = buttonOptions.background ? buttonOptions.background : '#81f1ff';
	button.innerHTML = buttonOptions.innerHTML ? buttonOptions.innerHTML : 'Insert URL';

	button.addEventListener('click', function (params) {
		
		let url = prompt("Please enter " + "Twitch" + " URL:", "");
		// let cont = document.getElementById( id + '-container' );
		if (url == null || url == "") {
			// let war = document.createElement('p');
			// war.innerHTML = "Insert valid youtube url";
			// war.id = 'war';
			// cont.appendChild( war );
			// console.log('WORK');
			
		} else 
		{
			if (document.getElementById('error')) 
			{
				document.getElementById('error').remove();
			}
			console.log(url);
			let ids = getEmbedTwitchIds(url);
			if (!ids) {
				// let error = document.createElement('p');
				// error.innerHTML = "Insert valid " + player + " url";
				// error.style.color = 'red';
				// error.id = 'error';
				// cont.appendChild( error );
				alert("Insert valid " + buttonOptions.playerName + " url")
			}else if (ids.channel) {
				console.log(player);
				player.setChannel(ids.channel);
			}else if(ids.video) {
				player.setVideo(ids.video);
			}

		}
		
	})

	div.appendChild( button );
	let object = new CSS3DObject( div );
	object.position.set( buttonOptions.pos.x, buttonOptions.pos.y, buttonOptions.pos.z );
	object.rotation.y = buttonOptions.ry ? buttonOptions.ry : 0;

	config.sceneCSS.add(object);
}


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
		let embedURL = 'https://player.twitch.tv/?video=' + id +'&parent=streamernews.example.com' ;
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
let createDivPlayer = (width, height, pos, ry, scale) =>{
	return new Promise((resolve, reject) => {
		
		let div = document.createElement( 'div' );
		div.style.width = width + 'px';
		div.style.height = height + 'px';
		// div.style.backgroundColor = '#000';
		div.id ='divPlayerVideo';
		// document.body.appendChild(div);
		let object = new CSS3DObject( div );
		object.position.set( pos.x, pos.y, pos.z );
		object.scale.set( scale, scale, scale );
		object.rotation.y = ry;
		config.sceneCSS.add(object);
		setTimeout(() => {
			console.log('setinterval');
			if (document.getElementById("divPlayerVideo") !== null) {
				resolve();
			}else{
				console.log('asd');
			}
			
		}, 3000);
	})
};

let createTwitchPlayer = ( options, buttonOptions ) => {

	player = new Twitch.Player("divPlayerVideo", options);
	// console.log(player);
	player.setMuted(false);
	player.setVolume(0.5);
	
	addPopupURLTwitch( buttonOptions )
};

let createYoutubePlayer = (options, buttonOptions) => {
	player = new YT.Player("divPlayerVideo", {
		height: options.width,
		width: options.height,
		videoId: options.id,
		events: {
			'onReady': onPlayerReady,
		}
		
	});
	function onPlayerReady(event) {
        // event.target.playVideo();
    }
	addPopupURL( buttonOptions );
	let groupbuttons = document.createElement( 'div' );
	let button = document.createElement( 'button' );
	button.innerHTML = "Play";
	let vol = document.createElement( 'button' );
	vol.innerHTML = "+";
	let volMinus = document.createElement( 'button' );
	volMinus.innerHTML = "-";
	volMinus.style.marginLeft = "10px";
	groupbuttons.appendChild(button);
	groupbuttons.appendChild(vol);
	groupbuttons.appendChild(volMinus);
	
	
	// return object;
	let object1 = new CSS3DObject( groupbuttons );
	object1.position.set( buttonOptions.pos.x, -160, buttonOptions.pos.z );

	config.sceneCSS.add(object1);
	// If EXISTE el div con id twitchPlayer hacer esta vaina
	button.addEventListener('click', function (params) {
		if (player.getPlayerState() != 1  ) //paused or unstarted
		{
			player.playVideo()
		}else{
			player.pauseVideo()
 
		}
    })
	vol.addEventListener('click', function (params) {
		if (player.getVolume() + 10 <= 100) {
			console.log(player.getVolume());
			player.setVolume(player.getVolume() + 10)
			console.log(player.getVolume());
	}
	});
	volMinus.addEventListener('click', function (params) {
		if (player.getVolume() - 10 >= 0) {
			console.log(player.getVolume());
			player.setVolume(player.getVolume() - 10)
			console.log(player.getVolume());
			
		}
		
	});
}

let addYoutubePlayer = ( src, id, pos, ry, buttonOptions = {}, width = 1080, height = 620, scale = 1 ) => 
{
	
	createDivPlayer(width, height, pos, ry, scale).then(() =>{
		let videoId = src && src.match(MATCH_URL_YOUTUBE)[1];
		
		let options = {
			width: width,
			height: height,
			id: videoId,
			playerVars: { 'autoplay': 0, 'controls': 0 },
    
			// controls: false,
			// only needed if your site is also embedded on embed.example.com and othersite.example.com 
			// playerVars:{

			// 	'origin': /*location.protocol + '//' +*/ window.location.hostname
			// }
		};
		createYoutubePlayer(options, buttonOptions);
	})
	

	
}

let addTwitchPlayer =( src, id, pos, ry, buttonOptions = {}, width = 1080, height = 620, scale = 1 ) =>{
	let groupbuttons = document.createElement( 'div' );
	let button = document.createElement( 'button' );
	button.innerHTML = "Load";
	let vol = document.createElement( 'button' );
	vol.innerHTML = "+";
	vol.style.marginLeft = "10px";
	let volMinus = document.createElement( 'button' );
	volMinus.innerHTML = "-";
	volMinus.style.marginLeft = "10px";
	let mute = document.createElement( 'button' );
	mute.innerHTML = "mute";
	mute.style.marginLeft = "15px";
	let volslider = document.createElement("INPUT"); 
	volslider.setAttribute("type", "range"); 
	volslider.min = 0;
	volslider.max = 1;
	volslider.value = 0.5; 
	volslider.step = 0.1; 


	//Twitch player API version
	createDivPlayer(width, height, pos, ry, scale).then(() =>{
		let ids = getEmbedTwitchIds(src);
		
		let options = {
			width: width,
			height: height,
			channel: ids.channel,
			video: ids.video,
			// controls: false,
			// only needed if your site is also embedded on embed.example.com and othersite.example.com 
			parent: [window.location.hostname]
		};
		createTwitchPlayer(options, buttonOptions);
	})
	


	// return object;
	let object1 = new CSS3DObject( groupbuttons );
	object1.position.set( pos.x, -160, pos.z );

	config.sceneCSS.add(object1);
	// If EXISTE el div con id twitchPlayer hacer esta vaina
	button.addEventListener('click', function (params) {
		
		player.setChannel('ibai')
    })
	vol.addEventListener('click', function (params) {
		if (player.getVolume() + 0.1 <= 1) {

		player.setVolume(player.getVolume() + 0.1)
		}
	});
	volMinus.addEventListener('click', function (params) {
		if (player.getVolume() - 0.1 > 0) {
			player.setVolume(player.getVolume() - 0.1)
			
		}
		
	});
	mute.addEventListener('click', function() {
		player.setMuted( !player.getMuted() );
	})
	// groupbuttons.appendChild(button);
	groupbuttons.appendChild(volMinus);
	groupbuttons.appendChild(vol);
	groupbuttons.appendChild(mute);
	// groupbuttons.appendChild(volslider);
	
	volslider.addEventListener('click', function(params) {
		/* if (this.value > 0 && this.value < 5) {
			alert("First");
		} */ /* else{
			alert("Second");
		} */
		console.log(params)
	});
	// groupbuttons.appendChild(button);
	// groupbuttons.appendChild(vol);
	
} 

let init = () => {
	
	
	
	config.sceneCSS = new THREE.Scene();
	config.sceneGL = new THREE.Scene();

	config.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 2000 );
	
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
	config.camera.position.x = -200;
	config.camera.position.y = 0;
	config.camera.position.z = 1300;
	config.camera.lookAt(-200,0,0);
	
	//Add iframes
	// addIFrame( getEmbedYT('https://www.youtube.com/watch?v=drTyVcMHy_k'), 'youtube', new Vector3( 600, 200, 0 ), 0 );
	let buttonops = {
		pos: new Vector3( 0, -130, 0 )
	};
	// addTwitchPlayer( ('https://www.twitch.tv/tfue'), 'twitch', new Vector3( 0, 200, 0 ), 0, buttonops  );
	addYoutubePlayer( ('https://www.youtube.com/watch?v=Z3UF_h0fbRg'), 'youtube', new Vector3( 0, 200, 0 ), 0, buttonops  );
	//Add input buttons
	// addPopupURLIFrame( 'youtubeURL', 'youtube', 'youtube', new Vector3( 600, -130, 0 ), 0 );
	// addPopupURL( 'twitchURL', 'twitch', 'twitch', new Vector3( -600, -130, 0 ), 0 );
	
	//Init controls
	config.controls = new OrbitControls( config.camera, config.rendererCSS.domElement );
	// config.controlsGL = new OrbitControls( config.camera, config.rendererGL.domElement );
	
	config.controls.keys = {
		LEFT: 65, //A
		UP: 87, // W
		RIGHT: 68, // D
		BOTTOM: 83 // S
	};
	// config.controlsGL.keys = config.controls.keys;
	
	//Set light
	let light = new THREE.AmbientLight(0xffffff);
	config.sceneGL.add(light);
	//Set cube
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
	// config.sceneGL.add( cube );
	//Set floor
	let floorTexture = new THREE.ImageUtils.loadTexture( 'assets/checkerboard.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 35, 35 );
	let floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	let floorGeometry = new THREE.PlaneGeometry(3500, 3500, 35, 35);
	let TeleportFloor = new THREE.Mesh(floorGeometry, floorMaterial);
	TeleportFloor.position.y = 450;
	TeleportFloor.rotation.x = -Math.PI / 3;
	TeleportFloor.name = 'TeleportFloor';
	// config.sceneGL.add(TeleportFloor);
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
	
	config.controls.update();
	config.rendererCSS.render( config.sceneCSS, config.camera );
	config.rendererGL.render( config.sceneGL, config.camera );
	
	//La idea pasada de "cambiar" de render dependiendo de la distancia
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