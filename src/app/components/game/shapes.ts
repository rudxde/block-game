export interface IShape {
    height: number;
    width: number;
    fields: { x: number, y: number }[]
}

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
        width: newShape.height,
        height: newShape.width,
        fields: fields,
    };
}

function mirrorShape(shape: IShape, horizontal: boolean): IShape {
    return {
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

export function getShapes(): IShape[] {
    return [
        // small T
        ...transformShape({ height: 3, width: 2, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 1 }] }, 1, 'vertical'),
        // big T
        ...transformShape({ height: 3, width: 3, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 1 }, { x: 2, y: 1 }] }, 1, 'vertical'),
        // small L
        ...transformShape({ height: 3, width: 2, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }] }, 3, 'horizontal'),
        // S
        ...transformShape({ height: 3, width: 2, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }] }, 3, 'horizontal'),
        // quadrat
        ...transformShape({ height: 2, width: 2, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }] }, 0, 'no'),
        // big L
        ...transformShape({ height: 3, width: 3, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }] }, 3, 'no'),
        // C
        ...transformShape({ height: 3, width: 2, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 2 },] }, 3, 'horizontal'),
        // sticks
        ...transformShape({ height: 1, width: 1, fields: [{ x: 0, y: 0 }] }, 0, 'no'),
        ...transformShape({ height: 2, width: 1, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }] }, 1, 'no'),
        ...transformShape({ height: 3, width: 1, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }] }, 1, 'no'),
        ...transformShape({ height: 4, width: 1, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }] }, 1, 'no'),
        ...transformShape({ height: 5, width: 1, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }] }, 1, 'no'),
        // slash
        ...transformShape({ height: 2, width: 2, fields: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }, 1, 'no'),
        ...transformShape({ height: 3, width: 3, fields: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }] }, 1, 'no'),
    ];
}
