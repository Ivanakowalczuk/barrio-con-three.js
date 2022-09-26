//https://cdn.jsdelivr.net/npm/three@0.144.0/
//https://cdn.jsdelivr.net/npm/three@0.119.1/

let renderer;
let container;
let scene;
let camera;

let esDeDia=false;
let c1=0;
let SEMILLA1=49823.3232;
let SEMILLA2=92733.112;

function inicializarThreeJs(){  
    // creamos el renderer y lo asociamos al contenedor 3D
    container = document.getElementById("contenedor3D");
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setClearColor(0xcccccc);
    container.appendChild(renderer.domElement);
    renderer.setSize(container.offsetWidth, container.offsetHeight);

    // creamos la escena
    scene = new THREE.Scene();
  
    // creamos la cámara
    camera = new THREE.PerspectiveCamera(45,1,0.1,1000);    
    camera.position.set(50, 50, 50);
    camera.lookAt(0, 0, 0);

    // creamos el control de camara
    let orbitalCamControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitalCamControls.minPolarAngle=0.01;
    orbitalCamControls.maxPolarAngle=Math.PI/2-0.01;

    onResize();
    window.addEventListener("resize", onResize);

    let btnDiaNoche=document.getElementById("btnDiaNoche");
    btnDiaNoche.addEventListener("click",cambiaDiaNoche);
  
}

function onResize() {
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();
}

function render() {  
  requestAnimationFrame(render);
  renderer.render(scene, camera);  
}

function enteroAleatorio(desde,hasta){
  c1+=0.726262;
  return desde+Math.floor((0.5+0.5*Math.sin(c1*SEMILLA1))*(hasta-desde));
}

function numeroAleatorio(desde,hasta){
  c1+=0.9282;
  return desde+((0.5+0.5*Math.sin(c1*SEMILLA2)))*(hasta-desde);

}

function cambiaDiaNoche(){
  esDeDia=!esDeDia;  

  let lista=[];
  scene.children.forEach(function(v,i){
    lista.push(v);
  })

  lista.forEach(function(v,i){
    scene.remove(v);
  })

  c1=0;
  construirEscenario();
  construirBarrio();

}

function construirEscenario() {
  

  // agregamos la grilla y los ejes
  const size = 400;
  const divisions = 40;

  const gridHelper = new THREE.GridHelper(size, divisions,0xFFFFFF,0xAAAAAA);
  gridHelper.position.y=-0.05
  scene.add(gridHelper);
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  // creamos las luces
  let directionalLight;
  let hemiLight;

  if (esDeDia) {// de dia

      directionalLight = new THREE.DirectionalLight(0xffeeee, 1);
      directionalLight.position.set(2,3,1)
      hemiLight = new THREE.HemisphereLight( 0xebfaff, 0xb0a596, 0.3 );  

  } else {// de noche

      directionalLight = new THREE.DirectionalLight(0xeeeeff, 0.2);
      directionalLight.position.set(-1,2,3)
      hemiLight = new THREE.HemisphereLight( 0x8888DD, 0x080866, 0.2 );
  }

  scene.add(directionalLight);
  scene.add(hemiLight );

  // creamos un plano
  const suelo = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshPhongMaterial({ color: 0x998877, side: THREE.DoubleSide, shininess:1 })
  );
  suelo.rotation.x = -Math.PI / 2;
  suelo.position.y=-0.05;
  scene.add(suelo);
}

function crearArbol(altura, diametro){

  let color=new THREE.Color(0xffffff);
  color.setHSL(0.2+Math.random()*0.1,1,0.5)

  let arbol=new THREE.Group();
  
  let geoCopa = new THREE.SphereGeometry( diametro/2, 32, 16 );
  let matCopa = new THREE.MeshPhongMaterial( {color: color.getHex()} );        
  let copa=new THREE.Mesh( geoCopa, matCopa );
  copa.position.set(0,altura,0);

  let diamTronco=Math.max(0.1,diametro*0.1);

  let matTronco = new THREE.MeshPhongMaterial( {color: 0x993322} );
  let geoTronco = new THREE.CylinderGeometry( diamTronco/2, diamTronco, altura, 32 );
  geoTronco.translate(0,altura/2,0);
  let tronco=new THREE.Mesh( geoTronco, matTronco);
  

  arbol.add(tronco);
  arbol.add(copa);

  return arbol;
}

function crearParque(ancho,largo){
  
  let geoParque = new THREE.BoxGeometry( ancho, 0.05,largo ); 
   
  let matParque = new THREE.MeshPhongMaterial( {color: 0x339933} );
  let parque = new THREE.Mesh( geoParque, matParque );
  return parque;
}

function crearFarol(altura,intensidad,color){
    // creo el poste
    if (!color) color=0xFFFFFF;
    if (!intensidad) intensidad=0.3

    let farol=new THREE.Group();
    let geoPoste = new THREE.CylinderGeometry( 0.1, 0.1, altura, 12 );
    let matPoste = new THREE.MeshPhongMaterial( {color: 0x333333,shininess:64} );
    geoPoste.translate(0,altura/2,0);
    let cyl=new THREE.Mesh( geoPoste, matPoste );

    let matLampara = new THREE.MeshBasicMaterial( {color: color} );
    let geoLampara = new THREE.SphereGeometry( 0.3, 32, 16 );
    let lampara=new THREE.Mesh( geoLampara, matLampara);
    lampara.position.set(0,altura,0)

    farol.add(cyl);
    farol.add(lampara);

    if (!esDeDia){
      const light = new THREE.PointLight( color, intensidad, 10,1 );
      light.position.set( 0,altura,0 );
      farol.add( light );
    }


    return farol;
  
}

function colorHSL(tono,saturacion,iluminacion){
  
  let c=new THREE.Color();
  c.setHSL(tono,saturacion,iluminacion);
  return parseInt("0x"+c.getHexString());
}

function crearCasa(pisos,anchoFrente,color){

  if (!color) color=0xFFFFFF;
  if (!pisos) pisos=0;
  

  // creo el contenedor que representa la casa completa
  let casa=new THREE.Group();
  let alturaPiso=4;

  // creo el cuerpo principal de la casa
  let geoCasa = new THREE.BoxGeometry( anchoFrente, alturaPiso, 10 );
  geoCasa.translate(0,alturaPiso/2,0);
  let matCasa = new THREE.MeshPhongMaterial( {color: color} );
  let cube = new THREE.Mesh( geoCasa, matCasa );
  

  // creo el techo
  let geoTecho = new THREE.BoxGeometry( anchoFrente+1, 0.5, 11 );
  let matTecho = new THREE.MeshPhongMaterial( {color: 0xAA3333} );
  let panelTecho = new THREE.Mesh( geoTecho, matTecho );
  panelTecho.position.set(0,alturaPiso*pisos,0)
  casa.add(panelTecho);

  let geoVentana=new THREE.BoxGeometry( 3,1.5, 0.1 );
  geoVentana.rotateY(Math.PI/2);


  let matVentana = new THREE.MeshPhongMaterial( {color: 0x9999FF,shininess:64, emissive:(esDeDia?0x222222:0xAAAA66)} );
  let ventana0 = new THREE.Mesh( geoVentana, matVentana );
  

  // creo los pisos superiores
  let matLosa = new THREE.MeshPhongMaterial( {color: 0x333333} );
  for (i=0;i<pisos;i++){
    let geoLosa = new THREE.BoxGeometry( anchoFrente+1, 0.1, 11 );    
    let losa = new THREE.Mesh( geoLosa, matLosa );
    losa.position.set(0,alturaPiso*(i),0)
    casa.add(losa);

    let pisoSuperior=cube.clone();
    pisoSuperior.position.y=i*alturaPiso;
    casa.add(pisoSuperior)

    let ventana=ventana0.clone();
    ventana.position.set(-anchoFrente/2-0.1,i*alturaPiso+2,2)
    casa.add(ventana)

    ventana=ventana0.clone();
    ventana.position.set(+anchoFrente/2+0.1,i*alturaPiso+2,-2)
    casa.add(ventana)
  }

  // creo la puerta
  let geoPuerta = new THREE.BoxGeometry( 1, 2.2, 0.2 );
  let matPuerta = new THREE.MeshPhongMaterial( {color: 0x993300} );
  let puerta = new THREE.Mesh( geoPuerta, matPuerta );
  puerta.position.set(0,1.1,5)
  casa.add(puerta);
  

  return casa;

}

function crearLote(){

  let lote=new THREE.Group();
  let casa=crearCasa(numeroAleatorio(2,8),numeroAleatorio(8,14), colorHSL(0.1+numeroAleatorio(0,0.9),1,0.55));
  lote.add(casa);
  
  let parque=crearParque(30,20);
  lote.add(parque)
  
   // cantidad de faroles
  
  let anchoLineaDeFaroles=16;
  let alturaFarol=6;
  let cantidadDeFaroles=6;
  let separacionEntreFaroles=anchoLineaDeFaroles/(cantidadDeFaroles);
  let colorFaroles=numeroAleatorio(0.10,0.75);
  for (let i=0; i<cantidadDeFaroles; i++){
      let farol=crearFarol(alturaFarol+numeroAleatorio(2,4),0.5,colorHSL(0.1+numeroAleatorio(0,0.9),1,0.55));
      farol.position.set(anchoLineaDeFaroles/2-i*separacionEntreFaroles,0,9
   -numeroAleatorio(0,6));
      lote.add(farol); 
  }
  //arbol
  
  let anchoLineaDeArbol=10
  ;
  let alturaArbol=numeroAleatorio(2,9);
  let cantidadDeArbol=numeroAleatorio(4,7);
  let separacionEntreArbol=anchoLineaDeArbol/(cantidadDeArbol-1);
    
  for (let i=0;i<cantidadDeArbol;i++){
    arbol=crearArbol(alturaArbol+numeroAleatorio(2,8),numeroAleatorio(2,6));
    arbol.position.set(6+numeroAleatorio(0,3),0,(anchoLineaDeArbol-i*separacionEntreArbol)-4);
    lote.add(arbol)
  }
  
  return lote;
  }
function construirBarrio(){
  
let anchoLotes=120;
let cantidadDeLotes=12;
let separacionEntreLotes=20;

for (let i=0;i<=cantidadDeLotes;i++){

let lote=crearLote();
lote.position.set((anchoLotes/2-i*separacionEntreLotes)-10,0,0);
scene.add(lote)

}
  

for (let i=0;i<=cantidadDeLotes;i++){
let lote=crearLote();
lote.position.set((anchoLotes/2-i*separacionEntreLotes)-10,0,30);
lote.rotation.set(0,3.14,0);
scene.add(lote)

}
 
  
}

 

inicializarThreeJs();
construirEscenario();
construirBarrio();
render();


