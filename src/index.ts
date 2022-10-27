/* CSC-495 Virtual Reality Virtual Locomotion, Fall 2022
 * Author: Regis Kopper
 *
 * Based on
 * CSC 5619, Fall 2020
 * Author: Evan Suma Rosenberg
 * 
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Color3, Space } from "@babylonjs/core/Maths/math";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { WebXRControllerComponent } from "@babylonjs/core/XR/motionController/webXRControllercomponent";
import { WebXRInputSource } from "@babylonjs/core/XR/webXRInputSource";
import { WebXRCamera } from "@babylonjs/core/XR/webXRCamera";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Logger } from "@babylonjs/core/Misc/logger";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import {MeshBuilder} from  "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { LinesMesh } from "@babylonjs/core/Meshes/linesMesh";
import { Ray } from "@babylonjs/core/Culling/ray";
import { Axis } from "@babylonjs/core/Maths/math.axis";
import { Quaternion } from "@babylonjs/core/Maths/math.vector";

// Side effects
import "@babylonjs/core/Helpers/sceneHelpers";
import "@babylonjs/inspector";

enum LocomotionMode 
{
    viewDirected,
    handDirected,
    teleportation
}

class Game 
{ 
    private canvas: HTMLCanvasElement;
    private engine: Engine;
    private scene: Scene;

    private xrCamera: WebXRCamera | null; 
    private leftController: WebXRInputSource | null;
    private rightController: WebXRInputSource | null;

    private locomotionMode: LocomotionMode;
    private laserPointer: LinesMesh | null;
    private groundMeshes: Array<AbstractMesh>;
    private teleportPoint: Vector3 | null;

    constructor()
    {
        // Get the canvas element 
        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

        // Generate the BABYLON 3D engine
        this.engine = new Engine(this.canvas, true); 

        // Creates a basic Babylon Scene object
        this.scene = new Scene(this.engine);   

        this.xrCamera = null;
        this.leftController = null;
        this.rightController = null;

        this.locomotionMode = LocomotionMode.viewDirected;
        this.laserPointer = null;
        this.groundMeshes = [];
        this.teleportPoint = null;  

    }

    start() : void 
    {
        // Create the scene and then execute this function afterwards
        this.createScene().then(() => {

            // Register a render loop to repeatedly render the scene
            this.engine.runRenderLoop(() => { 
                this.update();
                this.scene.render();
            });

            // Watch for browser/canvas resize events
            window.addEventListener("resize", () => { 
                this.engine.resize();
            });
        });
    }

    private async createScene() 
    {
        // This creates and positions a first-person camera (non-mesh)
        var camera = new UniversalCamera("camera1", new Vector3(0, 1.6, 0), this.scene);
        camera.fov = 90 * Math.PI / 180;
        camera.minZ = .1;
        camera.maxZ = 100;

        // This attaches the camera to the canvas
        camera.attachControl(this.canvas, true);

       // Create a point light
       var pointLight = new PointLight("pointLight", new Vector3(0, 2.5, 0), this.scene);
       pointLight.intensity = 1.0;
       pointLight.diffuse = new Color3(.25, .25, .25);

        // Creates a default skybox
        const environment = this.scene.createDefaultEnvironment({
            createGround: true,
            groundSize: 100,
            skyboxSize: 50,
            skyboxColor: new Color3(0, 0, 0)
        });

        // Make sure the skybox is not pickable!
        environment!.skybox!.isPickable = false;

        // Creates the XR experience helper
        const xrHelper = await this.scene.createDefaultXRExperienceAsync({});

        // Assigns the web XR camera to a member variable
        this.xrCamera = xrHelper.baseExperience.camera;

        // Remove default teleportation and pointer selection
        xrHelper.teleportation.dispose();
        xrHelper.pointerSelection.dispose();

        // Create points for the laser pointer
        var laserPoints = [];
        laserPoints.push(new Vector3(0, 0, 0));
        laserPoints.push(new Vector3(0, 0, 1));

        // Create a laser pointer and make sure it is not pickable
        this.laserPointer = MeshBuilder.CreateLines("laserPointer", {points: laserPoints}, this.scene);
        this.laserPointer.color = Color3.White();
        this.laserPointer.alpha = .5;
        this.laserPointer.visibility = 0;
        this.laserPointer.isPickable = false;

        // Attach the laser pointer to the right controller when it is connected
        xrHelper.input.onControllerAddedObservable.add((inputSource) => {
            if(inputSource.uniqueId.endsWith("right"))
            {
                this.rightController = inputSource;
                this.laserPointer!.parent = this.rightController.pointer;
            }
            else 
            {
                this.leftController = inputSource;
            }  
        });

        // Don't forget to deparent the laser pointer or it will be destroyed!
        xrHelper.input.onControllerRemovedObservable.add((inputSource) => {

            if(inputSource.uniqueId.endsWith("right")) 
            {
                this.laserPointer!.parent = null;
                this.laserPointer!.visibility = 0;
            }
        });

        // Create a blue emissive material
        var blueMaterial = new StandardMaterial("blueMaterial", this.scene);
        blueMaterial.diffuseColor = new Color3(.284, .73, .831);
        blueMaterial.specularColor = Color3.Black();
        blueMaterial.emissiveColor = new Color3(.284, .73, .831);
    }

    // The main update loop will be executed once per frame before the scene is rendered
    private update() : void
    {
        // Polling for controller input
        this.processControllerInput();  
    }

    // Process event handlers for controller input
    private processControllerInput()
    {
    }

    private onRightThumbstick(component?: WebXRControllerComponent)
    {
        if(component?.changes.axes)
        {

        }
    }

}
/******* End of the Game class ******/   

// start the game
var game = new Game();
game.start();