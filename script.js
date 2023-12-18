/* 
 * The structure of the code is using classes,
 * yet no js modules are used.
 * I used my personal, old assets here are 
 * completely free for you and only you [Jake Chapa]
 * If any one else would need these assets,
 * they sould contact me at dev.mkebsi@gmail.com
 * The code can be reused freely and under the
 * MIT License.
 */

/**
* Classes
*/

// Utils
class Sizes {
  constructor() {
    this.resize();
    
    window.addEventListener('dblclick', this.fullScreen);
  }
  
  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;    
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
  }
  
  fullScreen() {
    if (!document.fullscreenElement) {
      document.querySelector("html").requestFullscreen();
    }
  }
}

class Interval {
  constructor() {
    this.start = Date.now();
    this.current = this.start;
    this.delta = 16;
    this.elapse = 0;
  }
  
  update() {
    const currentTime = Date.now();
    this.delta = currentTime - this.current;
    this.current = currentTime;
    this.elapse = this.current - this.start;
  }
}

class Tests {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    
    this.active = true;
    
    // Activate the line below to make the tests dynamic once #tests is added to the URL
    //this.active = window.location.hash === "tests";
    
    if (this.active) {
      this.gui = new dat.GUI();
      this.stats = new Stats();
      document.body.appendChild(this.stats.dom);
    }
  }
}


// Three.js Configurations
class Camera {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.sizes = this.app.sizes;
    this.canvas = this.app.canvas;
    
    this.setInstance();
    this.setOrbitControls();
  }
  
  setInstance() {
    this.instance = new THREE.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.01, 1000);
    this.instance.position.set(0, 0.2, 0.4);
  }
  
  setOrbitControls() {
    this.controls = new THREE.OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = Math.PI * 2;
  }
  
  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }
  
  update() {
    this.controls.update();
  }
}

class Renderer {
  constructor() {
    this.app = new App();
    this.sizes = this.app.sizes;
    this.tests = this.app.tests;
    this.camera = this.app.camera;
    this.canvas = this.app.canvas;
    this.scene = this.app.scene;
    
    this.setInstance();
    
    if (this.tests.active) {
      this.setTests();
    }
  }
  
  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.instance.outputColorSpace = THREE.SRGBColorSpace;
    
    // Active only one of those
    // this.instance.toneMapping = THREE.Linear;
    this.instance.toneMapping = THREE.CineonToneMapping;
    // this.instance.toneMapping = THREE.ACESFilmic;
    // this.instance.toneMapping = THREE.Reinhard;
    
    this.instance.toneMappingExposure = 1.75;
    this.instance.setClearColor('#000000');
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }
 
  setTests() {
    this.tests.gui
      .add(this.instance, 'toneMappingExposure', 0, 5, 0.001);
  }
  
  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }
  
  update() {
    this.instance.render(this.scene, this.camera.instance);
  }
}


// Three.js Environment 
class Mug {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.interval = this.app.interval;
    this.sizes = this.app.sizes;
    this.tests = this.app.tests;
    
    this.gltfLoader = new THREE.GLTFLoader();
    this.textureLoader = new THREE.TextureLoader();
    
    this.setScene();
    if (this.tests.active) {
      this.setTests();
    }
  }
  
  setScene() {
    this.matTextures = {
      optionA: './bg1.jpg',
      optionB: './bg2.jpg',
      optionC: './bg3.jpg',
      optionD: './bg4.jpg'
    };
    
    this.mugMap = this.textureLoader.load(this.matTextures.optionA);
    this.mugMap.colorSpace = THREE.SRGBColorSpace;
    this.mugMap.flipY = false;
    
    this.mugMat = new THREE.MeshStandardMaterial({
      map: this.mugMap,
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.1
    });
    
    this.envMat = new THREE.MeshStandardMaterial({
      color: 0x20201d
    });
    
    // Loading the Mug
    this.gltfLoader.load('./mug.glb', (gltf) => {
      gltf.scene.traverse((model) => {
        model.material = this.mugMat; 
      });
      
      gltf.scene.position.y = -0.05;
      gltf.scene.scale.set(1.3, 1.3, 1.3);
      
      this.scene.add(gltf.scene)
    });
    
    // Loading the Environment
    this.gltfLoader.load('./environment.glb', (gltf) => {
      gltf.scene.traverse((model) => {
        model.material = this.envMat; 
      });
      
      gltf.scene.position.y = -0.20;
      
      this.scene.add(gltf.scene)
    });
  }
  
  setTests() {
    this.tests.mug = this.tests.gui.addFolder('Mug');
    
    this.tests.mug
      .add(this.mugMat, 'roughness', 0, 1, 0.001);
    this.tests.mug
      .add(this.mugMat, 'metalness', 0, 1, 0.001);
    
    this.tests.mug
      .add(this, 'matTextures', this.matTextures)
      .onChange(() => {
        this.mugMap = this.textureLoader.load(this.matTextures);
        this.mugMap.colorSpace = THREE.SRGBColorSpace;
        this.mugMap.flipY = false;
        
        this.mugMat.map = this.mugMap;
      });
  }
}

class Lights {
  constructor() {
    this.app = new App();
    this.tests = this.app.tests;
    this.scene = this.app.scene;
    
    this.lightsColor = {
      a: '#ffffff',
      b: '#ffffff'
    };
    
    this.setLights();
    
    if (this.tests.active) {
      this.setTests();
    }
  }
  
  setLights() {
    this.lightA = new THREE.DirectionalLight(this.lightsColor.a, 4);
    this.lightA.position.set(5.6, 2.1, -10);
    
    this.lightB = new THREE.DirectionalLight(this.lightsColor.b, 1.9);
    this.lightB.position.set(-10, 3, 10);
    
    this.ambient = new THREE.AmbientLight(0xffffff, 1);
      
    this.scene.add(this.lightA, this.lightB, this.ambient);
  }
  
  setTests() {
    this.tests.lights = this.tests.gui.addFolder('Lights');
    
    this.tests.lights
      .addColor(this.lightsColor, 'a')
      .onChange(() => {
        this.lightA.color.set(this.lightsColor.a);
      })
      .name('LightA');
    this.tests.lights
      .add(this.lightA, 'intensity', 0, 20, 0.001)
      .name('LightAIntensity');
    this.tests.lights
      .add(this.lightA.position, 'x', -10, 10, 0.1)
      .name('LightAX');
    this.tests.lights
      .add(this.lightA.position, 'y', -10, 10, 0.1)
      .name('LightAY');
    this.tests.lights
      .add(this.lightA.position, 'z', -10, 10, 0.1)
      .name('LightAZ');
    
    this.tests.lights
      .addColor(this.lightsColor, 'b')
      .onChange(() => {
        this.lightB.color.set(this.lightsColor.b);
      })
      .name('LightB');
    this.tests.lights
      .add(this.lightB, 'intensity', 0, 20, 0.001)
      .name('LightBIntensity');
    this.tests.lights
      .add(this.lightB.position, 'x', -10, 10, 0.1)
      .name('LightBX');
    this.tests.lights
      .add(this.lightB.position, 'y', -10, 10, 0.1)
      .name('LightBY');
    this.tests.lights
      .add(this.lightB.position, 'z', -10, 10, 0.1)
      .name('LightBZ');
    
    this.tests.lights
      .add(this.ambient, 'intensity', 0, 20, 0.001)
      .name('AmbientLight');
  }
}

class World {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.tests = this.app.tests;
    
    this.mug = new Mug();
    this.lights = new Lights();
  }
  
  update() {
    
  }
}

// Main Class (The Manager)
class App {
  constructor(canvas) {
  
    // Global variable 
    // window.app = this; // indeed not in need
    
    if(instance)
    {
      return instance;
    }
    instance = this;
  
    // Parameters 
    this.canvas = canvas;
    
    // Fetching Utils
    this.tests = new Tests();
    this.sizes = new Sizes();
    this.interval = new Interval();
    
    // Fetching Three.js Configurations 
    this.scene = new THREE.Scene();
    this.camera = new Camera();
    this.renderer = new Renderer();
    
    // Fitching Three.js Environment 
    this.world = new World();
    
    // Calling Methods
    window.addEventListener("resize", () => {
      this.resize();
    });
    requestAnimationFrame(() => {
      this.update();
    });
    
    // Finall Log
    console.log("Using Three.js Verizon:", THREE.REVISION)
  }
  
  // Called once the page is resized
  resize() {
    this.sizes.resize();
    this.camera.resize();
    this.renderer.resize();
    this.world.update();
  }
  
  // Called every frame (60fps)
  update() {
    if (this.tests.active) {
      this.tests.stats.begin();
      this.interval.update();
      this.camera.update();
      this.renderer.update();
      this.world.update();
      requestAnimationFrame(() => {
        this.update();
      });
      this.tests.stats.end();
    } else {
      this.interval.update();
      this.camera.update();
      this.renderer.update();
      this.world.update();
      requestAnimationFrame(() => {
        this.update();
      });
    }
  }
}



/*
** Variables
*/
const canvas = document.getElementById("webgl");

let instance = null;
const app = new App(canvas);
