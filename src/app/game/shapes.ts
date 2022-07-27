export interface IShape {
    id: number;
    height: number;
    width: number;
    fields: { x: number, y: number }[]
}

let shapeIdCounter = 0;

function rotateShape(shape: IShape, rotation: number): IShape {
    let newShape = shape;
    if (rotation !== 90) {
        newShape = rotateShape(shape, rotation === 180 ? 90 : 180);
    }

    let fields = newShape.fields.map(field => ({
        x: newShape.height - field.y - 1,
        y: field.x,
    }));

    return {
        id: shapeIdCounter++,
        width: newShape.height,
        height: newShape.width,
        fields: fields,
    };
}

function mirrorShape(shape: IShape, horizontal: boolean): IShape {
    return {
        id: shapeIdCounter++,
        height: shape.height,
        width: shape.width,
        fields: shape.fields.map(field => ({
            x: !horizontal ? shape.width - field.x - 1 : field.x,
            y: !horizontal ? field.y : shape.height - field.y - 1,
        })),
    };
}

function transformShape(shape: IShape, rotations: number, mirror: 'no' | 'horizontal' | 'vertical' | 'all'): IShape[] {
    let mirrorResults: IShape[] = [shape];
    if (mirror === 'horizontal') {
        mirrorResults.push(mirrorShape(shape, true));
    } else if (mirror === 'vertical') {
        mirrorResults.push(mirrorShape(shape, false));
    } else if (mirror === 'all') {
        mirrorResults.push(mirrorShape(shape, true));
        mirrorResults.push(mirrorShape(shape, false));
    }
    let result: IShape[] = [...mirrorResults];
    for (let mirrorResult of mirrorResults) {
        for (let i = 0; i < rotations; i++) {
            result.push(rotateShape(mirrorResult, (90 * i)));
        }
    }
    return result;
}

export const Shapes = {
    smallT: transformShape({ id: shapeIdCounter++, height: 3, width: 2, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 1 }] }, 1, 'vertical'),
    bigT: transformShape({ id: shapeIdCounter++, height: 3, width: 3, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 1 }, { x: 2, y: 1 }] }, 1, 'vertical'),
    mediumL: transformShape({ id: shapeIdCounter++, height: 3, width: 2, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }] }, 3, 'horizontal'),
    sShape: transformShape({ id: shapeIdCounter++, height: 3, width: 2, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }] }, 1, 'horizontal'),
    square: transformShape({ id: shapeIdCounter++, height: 2, width: 2, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }] }, 0, 'no'),
    bigL: transformShape({ id: shapeIdCounter++, height: 3, width: 3, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }] }, 3, 'no'),
    cShape: transformShape({ id: shapeIdCounter++, height: 3, width: 2, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 2 },] }, 3, 'no'),
    bigCShape: transformShape({ id: shapeIdCounter++, height: 3, width: 3, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 0 }, { x: 2, y: 2 }] }, 3, 'no'),
    smallL: transformShape({ id: shapeIdCounter++, height: 2, width: 2, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] }, 3, 'no'),
    stick1: transformShape({ id: shapeIdCounter++, height: 1, width: 1, fields: [{ x: 0, y: 0 }] }, 0, 'no'),
    stick2: transformShape({ id: shapeIdCounter++, height: 2, width: 1, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }] }, 1, 'no'),
    stick3: transformShape({ id: shapeIdCounter++, height: 3, width: 1, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }] }, 1, 'no'),
    stick4: transformShape({ id: shapeIdCounter++, height: 4, width: 1, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }] }, 1, 'no'),
    stick5: transformShape({ id: shapeIdCounter++, height: 5, width: 1, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }] }, 1, 'no'),
    smallDiagonal: transformShape({ id: shapeIdCounter++, height: 2, width: 2, fields: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }, 1, 'no'),
    bigDiagonal: transformShape({ id: shapeIdCounter++, height: 3, width: 3, fields: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }] }, 1, 'no'),
    stair: transformShape({ id: shapeIdCounter++, height: 3, width: 3, fields: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 0, y: 1 }, { x: 1, y: 2 }] }, 3, 'no'),
    lEdge: transformShape({ id: shapeIdCounter++, height: 3, width: 3, fields: [{ x: 0, y: 0 }, { x: 0, y: 2 }, { x: 2, y: 2 }] }, 3, 'no'),
    rectangle: transformShape({ id: shapeIdCounter++, height: 3, width: 2, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }] }, 1, 'no'),
    bigSquare: transformShape({ id: shapeIdCounter++, height: 3, width: 3, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }] }, 1, 'no'),
    extremeSquare: transformShape({
        id: shapeIdCounter++, height: 5, width: 5, fields: (() => {
            let result: { x: number, y: number }[] = [];
            for (let x = 0; x < 5; x++) {
                for (let y = 0; y < 5; y++) {
                    result.push(({ x, y }));
                }
            }
            return result;
        })()
    }, 1, 'no'),
}

export function getShapes(): IShape[] {
    return [
        ...Shapes.smallT,
        ...Shapes.bigT,
        ...Shapes.smallL,
        ...Shapes.mediumL,
        ...Shapes.sShape,
        ...Shapes.square,
        ...Shapes.bigL,
        ...Shapes.cShape,
        ...Shapes.stick1,
        ...Shapes.stick2,
        ...Shapes.stick3,
        ...Shapes.stick4,
        ...Shapes.stick5,
        ...Shapes.smallDiagonal,
        ...Shapes.bigDiagonal,
    ];
}
