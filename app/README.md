# webRTC-challenge

I divided the challenge in major steps:

1. Basic Interface - done
2. get local media - done
3. make a healthbar that reacts to sound from webRTC media - done
4. create a peerconnection - done
5. get access to SDP (console.log) - done
6. send the SDP to another peer trough the socket server - in progress
7. send local media - to do
8. receive the remote peer local media - done?
9. sucess ! - to do

6 - Using socket.io and express

In regards to the healthbar, currently it's being "damaged" by
the local sound, but as soon as I retrieve the remote media
I just need to call the function somewhere else and pass
the remote stream instead of the local stream to the function.

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn dev
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
