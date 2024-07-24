const rtsp = require('rtsp-ffmpeg');
const Gpio = require('onoff').Gpio;

const ID_DEVICE = 'a95a3c74-8bc8-4047-aecb-b1022a7a4658';//nelekolar
const streamType = "rtsp" //rtsp||jpeg

const stream1  = new rtsp.FFMpeg({ input: "rtsp://admin:cambuilding1328@192.168.10.108/h264/ch1/sub/av_stream", rate: 1, resolution: '320x240', quality: 3, arguments: [ '-rtsp_transport', 'tcp', '-stimeout', '500000',] });
const stream2  = new rtsp.FFMpeg({ input: "rtsp://admin:cambuilding1328@192.168.10.102/h264/ch1/sub/av_stream", rate: 1, resolution: '320x240', quality: 3, arguments: [ '-rtsp_transport', 'tcp', '-stimeout', '500000',] });
const stream3  = new rtsp.FFMpeg({ input: "rtsp://admin:cambuilding1328@192.168.10.103/mpeg4/ch1/sub/av_stream", rate: 1, resolution: '320x240', quality: 3, arguments: [ '-rtsp_transport', 'tcp', '-stimeout', '500000',] });
const stream4  = new rtsp.FFMpeg({ input: "rtsp://admin:cambuilding1328@192.168.10.105/mpeg4/ch1/sub/av_stream", rate: 1, resolution: '320x240', quality: 3, arguments: [ '-rtsp_transport', 'tcp', '-stimeout', '500000',] });
const stream5  = new rtsp.FFMpeg({ input: "rtsp://admin:cambuilding1328@192.168.10.106/mpeg4/ch1/sub/av_stream", rate: 1, resolution: '320x240', quality: 3, arguments: [ '-rtsp_transport', 'tcp', '-stimeout', '500000',] });
const stream6  = new rtsp.FFMpeg({ input: "rtsp://admin:cambuilding1328@192.168.10.107/mpeg4/ch1/sub/av_stream", rate: 1, resolution: '320x240', quality: 3, arguments: [ '-rtsp_transport', 'tcp', '-stimeout', '500000',] });
const stream7  = new rtsp.FFMpeg({ input: "rtsp://admin:cambuilding1328@192.168.10.101/mpeg4/ch1/sub/av_stream", rate: 1, resolution: '320x240', quality: 3, arguments: [ '-rtsp_transport', 'tcp', '-stimeout', '500000',] });
const stream8  = new rtsp.FFMpeg({ input: "rtsp://admin:cambuilding1328@192.168.10.109/mpeg4/ch1/sub/av_stream", rate: 1, resolution: '320x240', quality: 3, arguments: [ '-rtsp_transport', 'tcp', '-stimeout', '500000',] });
const stream9  = new rtsp.FFMpeg({ input: "rtsp://admin:cambuilding1328@192.168.10.110/mpeg4/ch1/sub/av_stream", rate: 1, resolution: '320x240', quality: 3, arguments: [ '-rtsp_transport', 'tcp', '-stimeout', '500000',] });

const stream10 = new rtsp.FFMpeg({ input: "rtsp://admin:cambuilding1328@192.168.10.111/mpeg4/ch1/sub/av_stream", rate: 1, resolution: '320x240', quality: 3, arguments: [ '-rtsp_transport', 'tcp', '-stimeout', '500000',] });
const stream11 = new rtsp.FFMpeg({ input: "rtsp://admin:cambuilding1328@192.168.10.114/mpeg4/ch1/sub/av_stream", rate: 1, resolution: '320x240', quality: 3, arguments: [ '-rtsp_transport', 'tcp', '-stimeout', '500000',] });
const stream12 = new rtsp.FFMpeg({ input: "rtsp://admin:cambuilding1328@192.168.10.116/mpeg4/ch1/sub/av_stream", rate: 1, resolution: '320x240', quality: 3, arguments: [ '-rtsp_transport', 'tcp', '-stimeout', '500000',] });
const stream13 = new rtsp.FFMpeg({ input: "rtsp://admin:cambuilding1328@192.168.10.119/mpeg4/ch1/sub/av_stream", rate: 1, resolution: '320x240', quality: 3, arguments: [ '-rtsp_transport', 'tcp', '-stimeout', '500000',] });
const stream14 = new rtsp.FFMpeg({ input: "rtsp://admin:cambuilding1328@192.168.10.106/mpeg4/ch1/sub/av_stream", rate: 1, resolution: '320x240', quality: 3, arguments: [ '-rtsp_transport', 'tcp', '-stimeout', '500000',] });


const streamsBS = [

  { id: "bf4762d3-7163-408c-b395-41e6469426de", stream: stream1 }, //192.168.10.101	Cuarto tecnico
  { id: "d15adca1-1f71-4088-b47e-8f2366bdbda8", stream: stream2 }, //192.168.10.102	Cuarto piso
  { id: "216a4bbd-e2b6-48d2-8cd7-0ac3d1c9b4b2", stream: stream3 }, //192.168.10.103	Tercer piso
  { id: "70ed7009-9322-4ec7-9d98-d5bdfa5cfe96", stream: stream4 }, //192.168.10.105	Nor oriental
  { id: "9763943b-f440-4be5-b437-baad361779ee", stream: stream5 }, //192.168.10.106	Entrada Sotano
  { id: "e5bb18c6-62e6-4289-8504-54f4e93625a2", stream: stream6 }, //192.168.10.107	Jardin
  { id: "845dc560-9652-4a9f-b369-86502b649816", stream: stream7 }, //192.168.10.108	Sotano oriental
  { id: "4ee8b5f5-db66-4f77-be81-7bbb02eabc19", stream: stream8 }, //192.168.10.109	Segundo piso
  { id: "490055a5-b20b-40aa-9561-b5661997b52e", stream: stream9 }, //192.168.10.110	Nor Oriental
  { id: "d3471d43-5371-4a82-9565-a7f405cc1e31", stream: stream10 }, //192.168.10.111	Esclusa
  { id: "154e4e4c-8978-4125-9f03-bea3e35ffcdb", stream: stream11 }, //192.168.10.114	Recepcion
  { id: "34380e0f-b89b-4c71-b1cd-3d3526200b25", stream: stream12 }, //192.168.10.116	Entrada vehicular
  { id: "c6b1dd4c-8fef-43b4-8c91-7d2ce9e67dc7", stream: stream13 },  //192.168.10.119	Esquina norocc
  { id: "c1986788-638d-472d-a552-36cdf675dc21", stream: stream14 }  //192.168.10.119	Esquina norocc
]

const ID_DOORS = [
  { id: '1/2'   , alarm: 'DOOR_M' },
  { id: '2/1'   , alarm: 'DOOR_E' },
  { id: '3'   , alarm: 'DOOR_S' },
  { id: '4.6m', alarm: 'DOOR_V'},
  { id: '6m'  , alarm: 'DOOR_V'},
  { id: '35-30.6m-30'     , alarm: '' } 
]


module.exports ={ streamsBS, streamType, ID_DOORS, ID_DEVICE};