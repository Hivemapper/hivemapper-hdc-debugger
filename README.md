# hivemapper-hdc-debugger

## Install buf
Make sure you have buf installed
```bash
brew install bufbuild/buf/buf
```

## Install protoc-gen-connect and protoc-gen-es
Make sure you have installed `protoc-gen-es` and `protoc-gen-connect`
```bash
npm install --save-dev @bufbuild/buf @bufbuild/protoc-gen-connect-es @bufbuild/protoc-gen-es 
npm install @bufbuild/connect @bufbuild/connect-web @bufbuild/protobuf
```

## Generate proto
Once you have installed `protoc-gen-es` and `protoc-gen-connect`, generate the proto files with:
```bash
npm run build:generate
```

## Build js code for the events page
```bash
cd client
npm run build
cp dist/out.js ../cmd/debugger/debug
```

This will bundle all the `protoc-gen-es` and `protoc-gen-connect` code. Then we copy the `out.js` file to `./project_root/cmd/debugger/debug` to have the file ready for the events.html page. 
