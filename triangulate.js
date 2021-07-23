

// create canvas element and append it to document body
// var canvas = document.createElement('canvas');
// document.body.appendChild(canvas);

// // some hotfixes... ( ≖_≖)
// document.body.style.margin = 0;
// canvas.style.position = 'fixed';

// // get canvas 2D context and set him correct size
// var ctx = canvas.getContext('2d');
// resize();

// // last known position
// var pos = { x: 0, y: 0 };

// window.addEventListener('resize', resize);
// document.addEventListener('mousemove', draw);
// document.addEventListener('mousedown', setPosition);
// document.addEventListener('mouseenter', setPosition);

// // new position from mouse event
// function setPosition(e) {
//   pos.x = e.clientX - 300;
//   pos.y = e.clientY;
// }

// //Function for drawing a line
// function drawLine(ctx, begin, end) {

//     ctx.beginPath();
//     ctx.moveTo(...begin);
//     ctx.lineTo(...end);
//     ctx.stroke();
// }

// // resize canvas
// function resize() {
//     ctx.canvas.width = window.innerWidth;
//     ctx.canvas.height = window.innerHeight;
//   }
  
//   function draw(e) {
//     // mouse left button must be pressed
//     if (e.buttons !== 1) return;
  
//     ctx.beginPath(); // begin
  
//     ctx.lineWidth = 5;
//     ctx.lineCap = 'round';
//     ctx.strokeStyle = '#c0392b';
  
//     ctx.moveTo(pos.x, pos.y); // from
//     setPosition(e);
//     ctx.lineTo(pos.x, pos.y); // to
  
//     ctx.stroke(); // draw it!
//   }

//////////////////////////////////////////////////////////////////////
//Extrude function
function extrude(shape, axis) {

  const positions = [...shape.positions];

  for (let i = 0; i < shape.positions.length; i++) {
      positions.push(shape.positions[i] + axis[i % 3]);
  }
  const numVertices = shape.positions.length / 3;

  const triangles = [...shape.triangles];

  // for (let i = 0; i < shape.triangles.length; i++) {
  //     triangles.push(shape.triangles[i] + (numVertices));
  // }

  for (let i = shape.triangles.length - 1; i > -1; i--) {
      triangles.push(shape.triangles[i] + numVertices);
  }

  for(let i = 0; i < numVertices; i++) {
      let nexti = (i + 1) % numVertices;
      triangles.push(nexti, i, i + numVertices);
      triangles.push(nexti,i + numVertices, nexti + numVertices);
  }
  
  return {positions, triangles};
}  

function triangulate(positions) {
  
}

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("lightblue");
document.body.appendChild(renderer.domElement);

// Create a scene to hold all our shapes.
const scene = new THREE.Scene();

// Create a camera sitting at (0, 0, 15) and looking at (0, 0, 0).
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

//Trackball Controls
const controls = new THREE.TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 2;
controls.enabled = false;

//animate function
function animate() {

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  } 

let geometry = new THREE.BufferGeometry();

const positions = [];
const triangles = [0, 1, 2];

let shape = { positions, triangles };
// console.log(shape);

let clickCounter = 0;
let rand = 0;


const pointsMaterial = new THREE.PointsMaterial({
  color: 'red',
  size: 0.5,
});

function pointFunc(event) {
  
  console.log( 'mousedown',event );
  clickCounter++;

  var vec = new THREE.Vector3(); // create once and reuse
  var pos = new THREE.Vector3(); // create once and reuse

  vec.set(
    ( event.clientX / window.innerWidth ) * 2 - 1,
    - ( event.clientY / window.innerHeight ) * 2 + 1,
    0.5 );

  vec.unproject( camera );

  vec.sub( camera.position ).normalize();

  var distance = - camera.position.z / vec.z;

  pos.copy( camera.position ).add( vec.multiplyScalar( distance ) );

  console.log(pos);
  positions.push(pos.x, pos.y, pos.z);
  console.log(shape);

// console.log(shape.positions[shape.positions.length - 3]);
  // console.log("First index:" + shape.positions[0]);
  // console.log(shape.positions[shape.positions.length - 2]);
  // console.log("Second index:" + shape.positions[1]);

  if ( (shape.positions[shape.positions.length - 3] > shape.positions[0] - 1 && shape.positions[shape.positions.length - 3] < shape.positions[0] + 1) && 
    (shape.positions[shape.positions.length - 2] > shape.positions[1] - 1 && shape.positions[shape.positions.length - 2] < shape.positions[1] + 1) && clickCounter > 1) {
      console.log("OOOOGGGGGAAAAAA");
      console.log(shape.positions.pop());
      console.log(shape.positions.pop());
      console.log(shape.positions.pop());
      console.log(shape.positions);
      // shape.positions[shape.positions.length - 3] = shape.positions[0];
      // shape.positions[shape.positions.length - 2] = shape.positions[1];
      shape = extrude(shape, [0, 0, -2]);
      console.log(shape.positions);
      console.log(shape.triangles);

      geometry.setIndex(shape.triangles);

      geometry = geometry.toNonIndexed();

      geometry.computeVertexNormals();
      
      const material = new THREE.MeshPhongMaterial({
        color: 'orange',
        shininess: 90,
      });
      
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(2, 2, 1);
      camera.add(light);
      scene.add(camera);
      
      const mesh = new THREE.Mesh(geometry, material);
      
      const normals = new THREE.VertexNormalsHelper(mesh, 0.5, 0x00ff00, 1);
      
      scene.add(normals);
      scene.add(mesh);

      rand++;

      // document.removeEventListener('mousedown', event);
    }
  console.log(rand);
  if(rand > 0) {
    document.removeEventListener('mousedown', pointFunc);
    console.log("SCADATTLE SCADOOTTLE");
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(shape.positions), 3));
  const points = new THREE.Points(geometry, pointsMaterial);

  scene.add(points);

  animate();

  // Render the scene.
  renderer.render(scene, camera);

  }
  

document.addEventListener('mousedown', pointFunc, true);


/*

// create canvas element and append it to document body
// var canvas = document.createElement('canvas');
// document.body.appendChild(canvas);

// // some hotfixes... ( ≖_≖)
// document.body.style.margin = 0;
// canvas.style.position = 'fixed';

// // get canvas 2D context and set him correct size
// var ctx = canvas.getContext('2d');
// resize();

// // last known position
// var pos = { x: 0, y: 0 };

// window.addEventListener('resize', resize);
// document.addEventListener('mousemove', draw);
// document.addEventListener('mousedown', setPosition);
// document.addEventListener('mouseenter', setPosition);

// // new position from mouse event
// function setPosition(e) {
//   pos.x = e.clientX - 300;
//   pos.y = e.clientY;
// }

// //Function for drawing a line
// function drawLine(ctx, begin, end) {

//     ctx.beginPath();
//     ctx.moveTo(...begin);
//     ctx.lineTo(...end);
//     ctx.stroke();
// }

// // resize canvas
// function resize() {
//     ctx.canvas.width = window.innerWidth;
//     ctx.canvas.height = window.innerHeight;
//   }
  
//   function draw(e) {
//     // mouse left button must be pressed
//     if (e.buttons !== 1) return;
  
//     ctx.beginPath(); // begin
  
//     ctx.lineWidth = 5;
//     ctx.lineCap = 'round';
//     ctx.strokeStyle = '#c0392b';
  
//     ctx.moveTo(pos.x, pos.y); // from
//     setPosition(e);
//     ctx.lineTo(pos.x, pos.y); // to
  
//     ctx.stroke(); // draw it!
//   }

//////////////////////////////////////////////////////////////////////
//Extrude function
function extrude(shape, axis) {

  const positions = [...shape.positions];

  for (let i = 0; i < shape.positions.length; i++) {
      positions.push(shape.positions[i] + axis[i % 3]);
  }
  const numVertices = shape.positions.length / 3;

  const triangles = [...shape.triangles];

  // for (let i = 0; i < shape.triangles.length; i++) {
  //     triangles.push(shape.triangles[i] + (numVertices));
  // }

  for (let i = shape.triangles.length - 1; i > -1; i--) {
      triangles.push(shape.triangles[i] + numVertices);
  }

  for(let i = 0; i < numVertices; i++) {
      let nexti = (i + 1) % numVertices;
      triangles.push(nexti, i, i + numVertices);
      triangles.push(nexti,i + numVertices, nexti + numVertices);
  }
  
  return {positions, triangles};
}  

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("lightblue");
document.body.appendChild(renderer.domElement);

// Create a scene to hold all our shapes.
const scene = new THREE.Scene();

// Create a camera sitting at (0, 0, 15) and looking at (0, 0, 0).
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;



//animate function
function animate() {

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  } 

const geometry = new THREE.BufferGeometry();

const positions = [];
const triangles = [];

let shape = { positions, triangles };
// console.log(shape);

let clickCounter = 0;
let rand = 0;


const pointsMaterial = new THREE.PointsMaterial({
  color: 'red',
  size: 0.5,
});

document.addEventListener( 'pointerdown', function (event) {
  
  console.log( 'mousedown', event );
  clickCounter++;

  var vec = new THREE.Vector3(); // create once and reuse
  var pos = new THREE.Vector3(); // create once and reuse

  vec.set(
    ( event.clientX / window.innerWidth ) * 2 - 1,
    - ( event.clientY / window.innerHeight ) * 2 + 1,
    0.5 );

  vec.unproject( camera );

  vec.sub( camera.position ).normalize();

  var distance = - camera.position.z / vec.z;

  pos.copy( camera.position ).add( vec.multiplyScalar( distance ) );

  console.log(pos);
  positions.push(pos.x, pos.y, pos.z);
  console.log(shape);

// console.log(shape.positions[shape.positions.length - 3]);
  // console.log("First index:" + shape.positions[0]);
  // console.log(shape.positions[shape.positions.length - 2]);
  // console.log("Second index:" + shape.positions[1]);

  if ( (shape.positions[shape.positions.length - 3] > shape.positions[0] - 1 && shape.positions[shape.positions.length - 3] < shape.positions[0] + 1) && 
    (shape.positions[shape.positions.length - 2] > shape.positions[1] - 1 && shape.positions[shape.positions.length - 2] < shape.positions[1] + 1) && clickCounter > 1) {
      console.log("OOOOGGGGGAAAAAA");
      console.log(shape.positions.pop());
      console.log(shape.positions.pop());
      console.log(shape.positions.pop());
      console.log(shape.positions);
      // shape.positions[shape.positions.length - 3] = shape.positions[0];
      // shape.positions[shape.positions.length - 2] = shape.positions[1];
      shape = extrude(shape, [0, 0, -2]);
      console.log(shape.positions);
      console.log(shape.triangles);

      geometry.setIndex(shape.triangles);

      const separatedGeometry = geometry.toNonIndexed();

      geometry.computeVertexNormals();
      
      const material = new THREE.MeshPhongMaterial({
        color: 'orange',
        shininess: 90,
      });
      
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(2, 2, 1);
      camera.add(light);
      scene.add(camera);
      
      const mesh = new THREE.Mesh(geometry, material);
      
      const normals = new THREE.VertexNormalsHelper(mesh, 0.5, 0x00ff00, 1);
      
      scene.add(normals);
      scene.add(mesh);

      rand++;

      // document.removeEventListener('mousedown', event);
    }
  console.log(rand);
  if(rand > 0) {
    document.removeEventListener('mousedown', event);
    console.log("SCADATTLE SCADOOTTLE");
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(shape.positions), 3));
  const points = new THREE.Points(geometry, pointsMaterial);

  scene.add(points);

  animate();

  // Render the scene.
  renderer.render(scene, camera);

  }
  , false ); 
  
  //Trackball Controls
const controls = new THREE.TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 2;
controls.enabled = false;

*/