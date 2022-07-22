import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { getShapes, IShape } from './shapes';

interface IField {
  x: number;
  y: number;
  placed: boolean;
  highlighted: boolean;
  marked: boolean;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, AfterViewInit {

  height = 0;
  width = 0;
  gameField: IField[][];

  nextShapes: { shape?: IShape, isDragging: boolean }[] = [];

  allShapes: IShape[] = getShapes();

  showDebugLines = true;

  @ViewChild('canvas', { read: ElementRef }) canvas?: ElementRef<HTMLCanvasElement>;

  constructor() {
    this.gameField = new Array(9).fill(undefined).map((_, x) => new Array(9).fill(undefined).map((_, y) => (<IField>{
      x,
      y,
      placed: false,
      highlighted: false,
      marked: false,
    })));

    this.gameField[2][3].placed = true;
    this.gameField[3][3].placed = true;
    this.gameField[3][3].highlighted = true;
    this.gameField[4][3].marked = true;
  }

  ngOnInit(): void {
    this.refillShapes();
  }

  ngAfterViewInit(): void {
    if (!this.canvas) {
      throw new Error('canvas not found!');
    }
    this.setupListeners(this.canvas.nativeElement);
    this.setCanvasSize();
    let ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) {
      throw new Error('could not get 2d rendering context.');
    }
    this.draw(ctx);
  }

  setupListeners(canvas: HTMLCanvasElement) {
    window.addEventListener('resize', () => this.setCanvasSize());
    canvas.addEventListener('pointerdown', (e) => this.pointerDown(e.x, e.y));
    canvas.addEventListener('pointerup', (e) => this.pointerDown(e.x, e.y));
    canvas.addEventListener('pointermove', (e) => this.pointerDown(e.x, e.y));
  }

  refillShapes() {
    this.nextShapes = [
      { shape: this.getRandomShape(), isDragging: false },
      { shape: this.getRandomShape(), isDragging: false },
      { shape: this.getRandomShape(), isDragging: false },
    ];
  }
  getRandomShape(): IShape {
    return this.allShapes[Math.floor(Math.random() * this.allShapes.length)];
  }

  pointerMove(x: number, y: number) { }
  pointerDown(x: number, y: number) { }
  pointerUp(x: number, y: number) { }

  setCanvasSize() {
    let padding = 16;
    if (!this.canvas) {
      throw new Error('canvas not found!');
    }
    let height = window.innerHeight;
    let width = window.innerWidth;
    height -= padding * 2;
    width -= padding * 2;
    if (width > 500) {
      width = 500;
    }
    if (height > 700) {
      height = 700;
    }
    if (width > height - 200) {
      width = height - 200;
    } else {
      height = width + 200;
    }
    this.canvas.nativeElement.height = height;
    this.canvas.nativeElement.width = width;
    this.height = height;
    this.width = width;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
    this.drawGameField(ctx);
    this.drawNextShapes(ctx);
    this.drawDraggingShape(ctx);
    requestAnimationFrame(() => this.draw(ctx));
  }

  drawGameField(ctx: CanvasRenderingContext2D) {
    let w = this.width;
    let cellSize = 0.11111;

    function line(horizontal: boolean, position: number): void {
      if (horizontal) {
        ctx.moveTo(position * w, 0);
        ctx.lineTo(position * w, 1 * w);
      } else {
        ctx.moveTo(0, position * w);
        ctx.lineTo(1 * w, position * w);
      }
    }

    ctx.beginPath();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 1; i += cellSize) {
      let w = Math.round(i * 1000) / 1000;
      line(true, w);
      line(false, w);
    }
    ctx.stroke();
    ctx.closePath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;


    for (let x = 0; x < this.gameField.length; x++) {
      for (let y = 0; y < this.gameField[x].length; y++) {
        let field = this.gameField[x][y];
        if (!field.placed && !field.marked) {
          continue;
        }
        ctx.fillStyle = '#00F';
        if (field.marked) {
          ctx.fillStyle = '#DDD';
        }
        if (field.highlighted) {
          ctx.fillStyle = '#59F';
        }
        let x1 = (x / 9) * w;
        let y1 = (y / 9) * w;
        ctx.fillRect(x1, y1, cellSize * w, cellSize * w);
      }
    }

    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 1; i += cellSize * 3) {
      let w = Math.round(i * 1000) / 1000;
      line(true, w);
      line(false, w);
    }
    ctx.stroke();
    ctx.closePath();



  }

  drawNextShapes(ctx: CanvasRenderingContext2D) {
    let w = this.width;
    let previewSize = (w / 3) - 16;
    let offsetY = w + 16;

    if (this.showDebugLines) {
      ctx.beginPath();
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < this.nextShapes.length; i++) {
        let x = i * (previewSize + 16) + 16;
        let y = offsetY;
        ctx.moveTo(x, y);
        ctx.lineTo(x + previewSize, y);
        ctx.lineTo(x + previewSize, y + previewSize);
        ctx.lineTo(x, y + previewSize);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.closePath();
    }

    // let offsetY = w;
    for (let i = 0; i < this.nextShapes.length; i++) {
      let shape = this.nextShapes[i];
      if (!shape.shape) {
        continue;
      }
      // let offsetX = 0;
      let shapeCellSize = (previewSize / (shape.shape.height > shape.shape.width ? shape.shape.height : shape.shape.width));
      let offsetX = i * (previewSize + 16) + ((previewSize - (shapeCellSize * shape.shape.width)) / 2) + 16;
      for (let field of shape.shape.fields) {
        console.log({ x: field.x, y: field.y, shapeCellSize });
        let x = (field.x * shapeCellSize) + offsetX;
        let y = (field.y * shapeCellSize) + offsetY;
        ctx.fillStyle = '#00F';
        ctx.fillRect(x, y, shapeCellSize, shapeCellSize);
        if (this.showDebugLines) {
          ctx.fillStyle = '#FFF';
          ctx.fillText(`${field.x}|${field.y} (${shape.shape.width}|${shape.shape.height})`, x, y + 10);
        }
      }
    }
  }

  drawDraggingShape(ctx: CanvasRenderingContext2D) {

  }


}
