# blob

The aim of the game is simple - accumulate the mass of your blob queen! The mass of the blob queen will serve as token for the game.

The queen uses her mass to spawn other blobs via larvae. Each blob possesses special traits that enable the blob to generate mass for the queen in a particular way.

#### Blob Queen

Accumulates mass. Spawns larvae periodically.

<img width="156" alt="image" src="https://user-images.githubusercontent.com/14039116/173327156-af7084d7-8cfc-4b50-85fa-4e03a8a7e1d1.png">

#### Blob Larva

Can transform into different types of blobs. Transformation requires feeding from queen's mass.

<img width="40" alt="image" src="https://user-images.githubusercontent.com/14039116/173329433-34a6ff61-8678-416f-b85a-908c03048e5a.png">

#### Bloblet

Bloblets are the simplest form of blob. They are primarily used to gather shrubs to feed the Blob Queen.

<img width="38" alt="image" src="https://user-images.githubusercontent.com/14039116/173329534-0fdb9db5-6380-47f8-81d4-0ed48ac4d9cc.png">

#### Shrub

Food source for the Blob Queen and Bloblets.

<img width="78" alt="image" src="https://user-images.githubusercontent.com/14039116/173342211-07b94382-fe18-4a4a-8620-0e2c2c7ff5ad.png">


## Development

The game uses native HTML canvas along with state machines (xstate). 

Using npm
```
npm i && npm run dev
```

Using yarn:
```
yarn && yarn dev
```


