// Route for text compression

import express, { Router, Request, Response } from "express";
import { createFrequencyMap } from "../../utils/FrequencyMap";
import MinHeap, { NodeData, leafNode, HeapNode } from "../../utils/MinHeap";
import Queue from "../../utils/Queue";
export const encodeTextRouter: Router = express.Router();

interface ResponseMsg {
  status: number;
  msg: string;
}

encodeTextRouter.get("/", (req: Request, res: Response) => {
  console.log("Get Request on text compression");
  const responseMsg: ResponseMsg = {
    status: 200,
    msg: "Get Request recieved. Now what ?",
  };
  res.json(responseMsg);
});

// @post api
// Compress string
encodeTextRouter.post("/", (req: Request, res: Response) => {
  const text: string = req.body.compressionString; // Text to be compressed
  console.log("Your string: ");
  console.log(text);
  const mp: Map<string, number> = createFrequencyMap(text);
  const heap: MinHeap = new MinHeap(); // Creating a min heap for nodes

  for (let e of mp.entries()) {
    const NodeObj: NodeData = {
      nodeType: leafNode,
      char: e[0],
      freq: e[1],
    };
    const heapNode: HeapNode = new HeapNode(NodeObj);
    heap.push(heapNode);
  }
  console.log("Heap........................");
  heap.display();
  const responseMsg: ResponseMsg = {
    status: 200,
    msg: "Compressed",
  };
  res.json(responseMsg);
});