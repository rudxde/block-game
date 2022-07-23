import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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

  debugMode = false;

  private readonly cellSizeOfWidth = 0.11111;
  private readonly draggingOffsetY = -32;
  private readonly fieldHighlightColor = '#4094eb';
  private readonly fieldMarkedColor = '#AAA';
  private readonly fieldBaseColor = '#4270d8';
  private readonly fieldInnerBorderColor = '#5AF';
  private readonly fieldOuterBorderColor = '#000';
  private readonly markedFieldOuterBorderColor = '#555';
  private readonly fieldDisabledColor = '#555';
  private readonly sectorLineColor = '#000';
  private readonly fieldLineColor = '#555';
  
  
  dragX = 0;
  dragY = 0;

  score = 0;
  displayScore$ = new BehaviorSubject<number>(0);

  gameEnded$ = new BehaviorSubject<boolean>(false);

  @ViewChild('canvas', { read: ElementRef }) canvas?: ElementRef<HTMLCanvasElement>;


  constructor() {
    this.gameField = new Array(9).fill(undefined).map((_, x) => new Array(9).fill(undefined).map((_, y) => (<IField>{
      x,
      y,
      placed: false,
      highlighted: false,
      marked: false,
    })));
    this.newGame();
  }

  ngOnInit(): void {
    this.refillShapes();
  }

  tick() {
    if (this.score !== this.displayScore$.value) {
      this.displayScore$.next(this.displayScore$.value + 1);
    }
  }

  newGame() {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        this.gameField[i][j].highlighted = false;
        this.gameField[i][j].marked = false;
        this.gameField[i][j].placed = false;
      }
    }
    this.refillShapes();
    this.score = 0;
    this.displayScore$.next(0);
    this.gameEnded$.next(false);
  }

  debugShapeCount = 0;
  nextShape() {
    if (this.debugMode) {
      this.nextShapes = [
        { shape: this.allShapes[this.debugShapeCount], isDragging: false },
        { shape: this.allShapes[this.debugShapeCount + 1], isDragging: false },
        { shape: this.allShapes[this.debugShapeCount + 2], isDragging: false },
      ];
      this.debugShapeCount += 3;
      if (this.debugShapeCount >= this.allShapes.length) {
        this.debugShapeCount = 0;
      }
      return;
    }
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
    setInterval(() => this.tick(), 50);
    this.draw(ctx);
  }

  setupListeners(canvas: HTMLCanvasElement) {
    window.addEventListener('resize', () => this.setCanvasSize());
    window.addEventListener('pointermove', (e) => {
      e.preventDefault();
    });
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.pointerDown(e.offsetX, e.offsetY);
    });
    canvas.addEventListener('pointerup', (e) => {
      e.preventDefault();
      this.pointerUp(e.offsetX, e.offsetY);
    });
    canvas.addEventListener('pointermove', (e) => {
      e.preventDefault();
      this.pointerMove(e.offsetX, e.offsetY);
    });
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      // this.pointerDown(e.touches[0].clientX, e.touches[0].clientY + canvas.top);
    });
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      // this.pointerUp(e.clientX, e.offsetY);
    });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      // this.pointerMove(e.clientX, e.offsetY);
    });
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

  pointerMove(x: number, y: number) {
    this.dragX = x;
    this.dragY = y;
    this.markDraggingShape();
    this.checkEliminationMarking();
  }

  pointerDown(x: number, y: number) {
    if (this.gameEnded$.value) {
      return;
    }
    this.dragX = x;
    this.dragY = y;
    if (y < this.width + 16) {
      return;
    }
    this.pointerUp(x, y);
    let selectedNextOne = Math.floor(3 * x / this.width);
    this.nextShapes[selectedNextOne].isDragging = true;
  }

  pointerUp(x: number, y: number) {
    this.resetMarkings();



    let placed = this.placeDragging();

    let eliminations = this.checkEliminationMarking();

    let eliminated = this.eliminateHighlighted();


    let scoreIncrease = placed + eliminated;
    if (eliminations > 1) {
      scoreIncrease *= eliminations;
    }

    this.score += scoreIncrease;

    this.nextShapes.forEach(x => x.isDragging = false);
    if (this.nextShapes.reduce((acc, val) => acc && !val.shape, true)) {
      this.refillShapes();
    }

    if (!this.canDropAnyOfNextShapes()) {
      this.gameEnded$.next(true);
    }

  }

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
    ctx.strokeStyle = this.fieldLineColor;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 1; i += this.cellSizeOfWidth) {
      let w = Math.round(i * 1000) / 1000;
      line(true, w);
      line(false, w);
    }
    ctx.stroke();
    ctx.closePath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;



    ctx.beginPath();
    ctx.strokeStyle = this.sectorLineColor;
    ctx.lineWidth = 2;
    for (let i = 0; i <= 1; i += this.cellSizeOfWidth * 3) {
      let w = Math.round(i * 1000) / 1000;
      line(true, w);
      line(false, w);
    }
    ctx.stroke();
    ctx.closePath();


    for (let x = 0; x < this.gameField.length; x++) {
      for (let y = 0; y < this.gameField[x].length; y++) {
        let field = this.gameField[x][y];
        if (!field.placed && !field.marked) {
          continue;
        }
        ctx.fillStyle = this.fieldBaseColor;
        if (field.marked) {
          ctx.fillStyle = this.fieldMarkedColor;
        }
        if (field.highlighted) {
          ctx.fillStyle = this.fieldHighlightColor;
        }
        let x1 = (x / 9) * w;
        let y1 = (y / 9) * w;
        ctx.fillRect(x1, y1, this.cellSizeOfWidth * w, this.cellSizeOfWidth * w);
        
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.fieldOuterBorderColor;
        if (field.marked) {
          ctx.strokeStyle = this.markedFieldOuterBorderColor;
        }
        ctx.strokeRect(x1, y1, this.cellSizeOfWidth * w, this.cellSizeOfWidth * w);
        if (field.marked) {
          // don't draw border for marked fields
          continue;
        }
        ctx.strokeStyle = this.fieldInnerBorderColor;
        ctx.strokeRect(x1 + 1, y1 + 1, this.cellSizeOfWidth * w - 2, this.cellSizeOfWidth * w - 2);
      }
    }


  }

  drawNextShapes(ctx: CanvasRenderingContext2D) {
    let w = this.width;
    let previewSize = (w / 3) - 16;
    let offsetY = w + 16;

    if (this.debugMode) {
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
      if (!shape.shape || shape.isDragging) {
        continue;
      }
      const largestDimension = shape.shape.height > shape.shape.width ? shape.shape.height : shape.shape.width;
      // let offsetX = 0;
      let shapeCellSize = (previewSize / largestDimension);
      if (largestDimension === 2) {
        shapeCellSize *= 0.66;
      }
      if (largestDimension === 1) {
        shapeCellSize *= 0.33;
      }
      let offsetX = i * (previewSize + 16) + ((previewSize - (shapeCellSize * shape.shape.width)) / 2) + 16;
      this.drawShape(shape.shape, shapeCellSize, offsetX, offsetY, ctx);
    }
  }

  private drawShape(shape: IShape, shapeCellSize: number, offsetX: number, offsetY: number, ctx: CanvasRenderingContext2D) {
    if (this.debugMode) {
      ctx.fillStyle = '#000';
      ctx.fillText(`id: ${shape.id}`, offsetX, offsetY);
    }
    for (let field of shape.fields) {
      let x = (field.x * shapeCellSize) + offsetX;
      let y = (field.y * shapeCellSize) + offsetY;
      if (this.gameEnded$.value) {
        ctx.fillStyle = this.fieldDisabledColor;
      } else {
        ctx.fillStyle = this.fieldBaseColor;
      }
      ctx.fillRect(x, y, shapeCellSize, shapeCellSize);

      ctx.lineWidth = 1;
      ctx.strokeStyle = this.fieldOuterBorderColor;
      ctx.strokeRect(x, y, shapeCellSize, shapeCellSize);
      ctx.strokeStyle = this.fieldInnerBorderColor;
      ctx.strokeRect(x + 1, y + 1, shapeCellSize - 2, shapeCellSize - 2);

      if (this.debugMode) {
        ctx.fillStyle = '#FFF';
        ctx.fillText(`${field.x}|${field.y} (${shape.width}|${shape.height})`, x, y + 10);
      }
    }
  }

  drawDraggingShape(ctx: CanvasRenderingContext2D) {
    for (let shape of this.nextShapes) {
      if (!shape.shape || !shape.isDragging) {
        continue;
      }
      let offsetX = this.dragX - (shape.shape.width * this.cellSizeOfWidth * this.width / 2);
      let offsetY = this.dragY - (shape.shape.height * this.cellSizeOfWidth * this.width) + this.draggingOffsetY;
      this.drawShape(shape.shape, this.width * this.cellSizeOfWidth, offsetX, offsetY, ctx);
    }
  }

  resetMarkings() {
    this.gameField.forEach(line => line.forEach(field => {
      field.highlighted = false;
      field.marked = false;
    }));
  }

  placeDragging(): number {
    let placed = 0;
    this.resetMarkings();
    let dragging = this.nextShapes.find(x => x.isDragging);
    if (!dragging) {
      return 0;
    }
    if (!dragging.shape) {
      throw new Error('dragging shape has no shape');
    }
    const position = this.getDraggingCellPosition(dragging.shape);
    if (!this.positionIsOnBoard(position)) {
      return 0;
    }
    if (!this.canDropShape(dragging.shape, position)) {
      return 0;
    }
    placed = this.placeShape(dragging.shape, position);
    dragging.shape = undefined;
    dragging.isDragging = false;
    return placed;
  }

  markDraggingShape() {
    this.resetMarkings();
    let dragging = this.nextShapes.find(x => x.isDragging);
    if (!dragging) {
      return;
    }
    if (!dragging.shape) {
      throw new Error('dragging shape has no shape');
    }
    const position = this.getDraggingCellPosition(dragging.shape);
    if (!this.positionIsOnBoard(position)) {
      return;
    }
    if (!this.canDropShape(dragging.shape, position)) {
      return;
    }

    this.markShape(dragging.shape, position);
  }

  private canDropShape(shape: IShape, position: { x: number; y: number; }): boolean {
    for (let field of shape.fields) {
      const x = field.x + position.x;
      const y = field.y + position.y;
      if (x >= 9 || y >= 9) {
        return false;
      }
      if (this.gameField[x][y].placed) {
        return false;
      }
    }
    return true;
  }

  private positionIsOnBoard(p: { x: number, y: number }): boolean {
    if (
      p.x < 0
      || p.x >= 9
      || p.y < 0
      || p.y >= 9
    ) {
      return false;
    }
    return true;
  }

  private markShape(shape: IShape, position: { x: number; y: number; }) {
    for (let field of shape.fields) {
      this.gameField[field.x + position.x][field.y + position.y].marked = true;
    }
  }

  private placeShape(shape: IShape, position: { x: number; y: number; }): number {
    for (let field of shape.fields) {
      this.gameField[field.x + position.x][field.y + position.y].placed = true;
    }
    return shape.fields.length;
  }

  getDraggingCellPosition(dragging: IShape): { x: number, y: number } {

    let basePositionX = this.dragX - (dragging.width * this.cellSizeOfWidth * this.width / 2);
    let basePositionY = this.dragY - (dragging.height * this.cellSizeOfWidth * this.width) + this.draggingOffsetY;
    return {
      x: Math.round(basePositionX / (this.width * this.cellSizeOfWidth)),
      y: Math.round(basePositionY / (this.width * this.cellSizeOfWidth))
    }
  }

  private checkEliminationMarking(): number {
    let eliminations = 0;
    for (let i = 0; i < 9; i++) {
      let allMarkedX = true;
      let allMarkedY = true;
      for (let j = 0; j < 9; j++) {
        if (!this.gameField[i][j].placed && !this.gameField[i][j].marked) {
          allMarkedX = false;
        }
        if (!this.gameField[j][i].placed && !this.gameField[j][i].marked) {
          allMarkedY = false;
        }
      }
      if (allMarkedX) {
        eliminations++;
        for (let j = 0; j < 9; j++) {
          this.gameField[i][j].highlighted = true;
        }
      }
      if (allMarkedY) {
        eliminations++;
        for (let j = 0; j < 9; j++) {
          this.gameField[j][i].highlighted = true;
        }
      }
    }

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {

        let allMarked = true;

        for (let ii = 0; ii < 3; ii++) {
          for (let jj = 0; jj < 3; jj++) {
            if (!this.gameField[i * 3 + ii][j * 3 + jj].placed && !this.gameField[i * 3 + ii][j * 3 + jj].marked) {
              allMarked = false;
            }
          }
        }
        if (allMarked) {
          eliminations++;
          for (let ii = 0; ii < 3; ii++) {
            for (let jj = 0; jj < 3; jj++) {
              this.gameField[i * 3 + ii][j * 3 + jj].highlighted = true;
            }
          }
        }

      }
    }

    return eliminations;
  }

  private eliminateHighlighted(): number {
    let eliminated = 0;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (this.gameField[i][j].highlighted) {
          this.gameField[i][j].highlighted = false;
          this.gameField[i][j].placed = false;
          this.gameField[i][j].marked = false;
          eliminated++;
        }
      }
    }
    return eliminated;
  }

  private canDropAnyOfNextShapes(): boolean {
    for (let shape of this.nextShapes) {
      if (!shape.shape) {
        continue;
      }
      for (let i = 0; i < 9; i++) {
        if (9 - shape.shape.width < i) {
          continue;
        }
        for (let j = 0; j < 9; j++) {
          if (9 - shape.shape.height < j) {
            continue;
          }
          if (this.canDropShape(shape.shape, { x: i, y: j })) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
