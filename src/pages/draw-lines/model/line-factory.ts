import {
	type Point,
	clone,
	equals,
	add,
	sub,
	mult,
	dist,
	unit,
	mag,
	perp,
} from './point-utils'
import { arrayLineVertexFactory, arrayLineIndexesFactory } from './strcut-line'

import type { StructPointForLine } from './draw-lines.types'
import type { VertexArray, IndexesArray } from '@/modules/webgl/array'

type LineJoin = 'round' | 'fakeRound' | 'miter' | 'bevel' | 'flipBevel' | 'butt'
type Join = 'miter' | 'round'
type Cap = 'butt' | 'round'

export type LineTrianglesFactoryOptions = {
	data: Point[]
	join: Join
	cap: Cap
	miterLimit: number
	roundLimit: number
}

const EXTRUDE_SCALE = 63
const LINE_DISTANCE_BUFFER_BITS = 14
const LINE_DISTANCE_SCALE = 1 / 2
const MAX_LINE_DISTANCE =
	Math.pow(2, LINE_DISTANCE_BUFFER_BITS) / LINE_DISTANCE_SCALE / 2
const LINE_JOIN = {
	Round: 'round',
	FakeRound: 'fakeRound',
	Miter: 'miter',
	Bevel: 'bevel',
	FlipBevel: 'flipBevel',
	Butt: 'butt',
} as const

// variables

let _e1 = -1
let _e2 = -1
let _e3 = -1

let _distance = 0

let vertexArray: VertexArray<StructPointForLine> | null = null
let indexesArray: IndexesArray | null = null

const array = () => {
	if (vertexArray && indexesArray) {
		return {
			vertex: vertexArray,
			indexes: indexesArray,
		}
	}

	throw 'Массив не найден'
}

export const createLineArray = (options: LineTrianglesFactoryOptions) => {
	const { data, join, cap, miterLimit, roundLimit } = options

	vertexArray = arrayLineVertexFactory.create()
	indexesArray = arrayLineIndexesFactory.create()

	line(data, join, cap, miterLimit, roundLimit)

	return {
		vertex: vertexArray,
		indexes: indexesArray,
	}
}

const line = (
	line: Point[],
	join: Join,
	cap: Cap,
	miterLimit: number,
	roundLimit: number,
): void => {
	// Обрезает длину линии, если в ее начале и конце есть повторяющиеся точки
	const [first, last, len] = getAdjustedLine(line)

	// У линии должно быть минимум две точки
	if (len < 2) {
		return
	}

	const firstPoint = line[first]
	const lastPoint = line[last]
	const closed = equals(firstPoint, lastPoint)

	_distance = 0

	const endCap = closed ? 'butt' : cap

	let prevPoint!: Point
	let currentPoint!: Point

	let prevNormal!: Point
	let nextNormal!: Point

	let startOfLine = true

	_e1 = -1
	_e2 = -1
	_e3 = -1

	if (closed) {
		currentPoint = line[len - 2]
		nextNormal = perp(unit(sub(firstPoint, currentPoint)))
	}

	for (let i = 0; i < len; i++) {
		// Если линия замкнута, мы рассматриваем последнюю вершину как первую
		const idx = (closed && i === last ? 0 : i) + 1
		const nextPoint = line[idx]

		// Если существуют две последовательные точки, пропускаем текущую
		if (nextPoint && equals(line[i], nextPoint)) {
			continue
		}

		if (nextNormal) {
			prevNormal = nextNormal
		}

		if (currentPoint) {
			prevPoint = currentPoint
		}

		currentPoint = line[i]

		// Рассчитываем нормаль к следующей вершине линии. В случае,
		// если следующей вершины нет, представляем, что линия продолжается прямо,
		// то есть просто используем предыдущую нормаль
		nextNormal = nextPoint
			? perp(unit(sub(nextPoint, currentPoint)))
			: prevNormal

		// Если у нас все еще нет предыдущей нормали, это начало
		// незамкнутой линии, поэтому мы делаем прямое соединение
		prevNormal = prevNormal || nextNormal

		// Определяем нормаль "join" соединения. Это биссектриса угла
		// между предыдущей и следующей линией.
		let joinNormal = add(prevNormal, nextNormal)
		if (joinNormal.x !== 0 || joinNormal.y !== 0) {
			joinNormal = unit(joinNormal)
		}

		const cosHalfAngle =
			joinNormal.x * nextNormal.x + joinNormal.y * nextNormal.y
		const miterLength = cosHalfAngle !== 0 ? 1 / cosHalfAngle : Infinity

		const currentJoin = calculateJoin(
			prevPoint,
			nextPoint,
			join,
			cap,
			endCap,
			miterLimit,
			roundLimit,
			miterLength,
		)

		// Рассчитываем, как далеко вдоль линии находится текущая вершина
		if (prevPoint) {
			_distance += dist(currentPoint, prevPoint)
		}

		if (currentJoin === LINE_JOIN.Miter) {
			miterLine(currentPoint, joinNormal, miterLength)
		} else if (currentJoin === LINE_JOIN.FakeRound) {
			fakeRoundOrBevelLine(
				currentPoint,
				nextPoint,
				prevNormal,
				nextNormal,
				joinNormal,
				miterLength,
				cosHalfAngle,
				startOfLine,
				true,
			)
		} else if (currentJoin === LINE_JOIN.Round) {
			roundLine(
				currentPoint,
				nextNormal,
				prevNormal,
				nextNormal,
				startOfLine,
			)
		} else if (currentJoin === LINE_JOIN.FlipBevel) {
			flipBevelLine(
				currentPoint,
				prevNormal,
				nextNormal,
				joinNormal,
				miterLength,
			)
		} else if (currentJoin === LINE_JOIN.Butt) {
			buttLine(
				currentPoint,
				nextPoint,
				prevNormal,
				nextNormal,
				startOfLine,
			)
		} else if (currentJoin === LINE_JOIN.Bevel) {
			fakeRoundOrBevelLine(
				currentPoint,
				nextPoint,
				prevNormal,
				nextNormal,
				joinNormal,
				miterLength,
				cosHalfAngle,
				startOfLine,
				false,
			)
		} else {
			throw new Error(`Unknown join "${currentJoin}"`)
		}

		startOfLine = false
	}
}

const getAdjustedLine = (
	line: Point[],
): [first: number, last: number, len: number] => {
	let first = 0
	let len = line.length

	while (len >= 2 && equals(line[len - 1], line[len - 2])) {
		len -= 1
	}

	while (first < len - 1 && equals(line[first], line[first + 1])) {
		first += 1
	}

	return [first, len - 1, len]
}

const calculateJoin = (
	prevPoint: Point,
	nextPoint: Point,
	join: Join,
	cap: Cap,
	endCap: Cap,
	miterLimit: number,
	roundLimit: number,
	miterLength: number,
): LineJoin => {
	// Если текущая точка промежуточная - используем параметр "line-join"
	// Если крайняя - используем "line-cap"
	const isIntermediatePoint = Boolean(prevPoint && nextPoint)
	let currentJoin: LineJoin = isIntermediatePoint
		? join
		: nextPoint
			? cap
			: endCap

	if (isIntermediatePoint && currentJoin === LINE_JOIN.Round) {
		if (miterLength < roundLimit) {
			currentJoin = LINE_JOIN.Miter
		} else if (miterLength <= 2) {
			currentJoin = LINE_JOIN.FakeRound
		}
	}

	if (currentJoin === LINE_JOIN.Miter && miterLength > miterLimit) {
		currentJoin = LINE_JOIN.Bevel
	}

	if (currentJoin === LINE_JOIN.Bevel) {
		if (miterLength > 2) {
			currentJoin = LINE_JOIN.FlipBevel
		}

		if (miterLength < miterLimit) {
			currentJoin = LINE_JOIN.Miter
		}
	}

	return currentJoin
}

const miterLine = (
	currentPoint: Point,
	joinNormal: Point,
	miterLength: number,
): void => {
	addCurrentPoint(
		currentPoint,
		_distance,
		mult(joinNormal, miterLength),
		0,
		0,
		false,
	)
}

const fakeRoundOrBevelLine = (
	currentPoint: Point,
	nextPoint: Point,
	prevNormal: Point,
	nextNormal: Point,
	joinNormal: Point,
	miterLength: number,
	cosHalfAngle: number,
	startOfLine: boolean,
	fakeRound: boolean,
): void => {
	let offsetA = 0
	let offsetB = 0

	const lineTurnsLeft =
		prevNormal.x * nextNormal.y - prevNormal.y * nextNormal.x > 0
	const offset = -Math.sqrt(miterLength * miterLength - 1)

	if (lineTurnsLeft) {
		offsetA = offset
	} else {
		offsetB = offset
	}

	if (!startOfLine) {
		addCurrentPoint(
			currentPoint,
			_distance,
			prevNormal,
			offsetA,
			offsetB,
			false,
		)
	}

	if (fakeRound) {
		const n = Math.floor((0.5 - (cosHalfAngle - 0.5)) * 8)

		for (let i = 0; i < n; i++) {
			const approxFractionalJoinNormal = unit(
				add(mult(nextNormal, (i + 1) / (n + 1)), prevNormal),
			)

			addPieSliceVertex(
				currentPoint,
				// _distance,
				approxFractionalJoinNormal,
				lineTurnsLeft,
			)
		}

		addPieSliceVertex(
			currentPoint,
			// _distance,
			joinNormal,
			lineTurnsLeft,
		)

		for (let i = n - 1; i >= 0; i--) {
			const approxFractionalJoinNormal = unit(
				add(mult(prevNormal, (i + 1) / (n + 1)), nextNormal),
			)

			addPieSliceVertex(
				currentPoint,
				// _distance,
				approxFractionalJoinNormal,
				lineTurnsLeft,
			)
		}
	}

	if (nextPoint) {
		addCurrentPoint(
			currentPoint,
			_distance,
			nextNormal,
			-offsetA,
			-offsetB,
			false,
		)
	}
}

const roundLine = (
	currentPoint: Point,
	nextPoint: Point,
	prevNormal: Point,
	nextNormal: Point,
	startOfLine: boolean,
): void => {
	if (!startOfLine) {
		// Close previous segment with butt
		addCurrentPoint(currentPoint, _distance, prevNormal, 0, 0, false)

		// Add round cap or linejoin at end of segment
		addCurrentPoint(currentPoint, _distance, prevNormal, 1, 1, true)

		// The segment is done. Unset vertices to disconnect segments.
		_e1 = _e2 = -1
	}

	// Start next segment with a butt
	if (nextPoint) {
		// Add round cap before first segment
		addCurrentPoint(currentPoint, _distance, nextNormal, -1, -1, true)

		addCurrentPoint(currentPoint, _distance, nextNormal, 0, 0, false)
	}
}

const flipBevelLine = (
	currentPoint: Point,
	prevNormal: Point,
	nextNormal: Point,
	joinNormal: Point,
	miterLength: number,
): void => {
	let nextJoinNormal = joinNormal

	if (miterLength > 100) {
		nextJoinNormal = mult(clone(nextNormal), -1)
	} else {
		const direction =
			prevNormal.x * nextNormal.y - prevNormal.y * nextNormal.x > 0
				? -1
				: 1
		const bevelLength =
			(miterLength * mag(add(prevNormal, nextNormal))) /
			mag(sub(prevNormal, nextNormal))

		nextJoinNormal = mult(perp(joinNormal), bevelLength * direction)
	}

	addCurrentPoint(currentPoint, _distance, nextJoinNormal, 0, 0, false)
	addCurrentPoint(
		currentPoint,
		_distance,
		mult(nextJoinNormal, -1),
		0,
		0,
		false,
	)
}

const buttLine = (
	currentPoint: Point,
	nextPoint: Point,
	prevNormal: Point,
	nextNormal: Point,
	startOfLine: boolean,
): void => {
	if (!startOfLine) {
		addCurrentPoint(currentPoint, _distance, prevNormal, 0, 0, false)
	}

	if (nextPoint) {
		addCurrentPoint(currentPoint, _distance, nextNormal, 0, 0, false)
	}
}

const addCurrentPoint = (
	currentPoint: Point,
	distance: number,
	normal: Point,
	endLeft: number,
	endRight: number,
	round: boolean,
): void => {
	const tx = round ? 1 : 0
	const { vertex, indexes } = array()

	let extrude = clone(normal)

	if (endLeft) {
		extrude = sub(extrude, mult(perp(normal), endLeft))
	}

	_e3 = addLineVertex(
		vertex,
		currentPoint,
		extrude,
		tx,
		0,
		// endLeft,
		// distance,
	)

	if (_e1 >= 0 && _e2 >= 0) {
		indexes.push({
			index: [_e1, _e2, _e3],
		})
	}

	_e1 = _e2
	_e2 = _e3

	extrude = mult(normal, -1)

	if (endRight) {
		extrude = sub(extrude, mult(perp(normal), endRight))
	}

	_e3 = addLineVertex(
		vertex,
		currentPoint,
		extrude,
		tx,
		1,
		// -endRight,
		// distance,
	)

	if (_e1 >= 0 && _e2 >= 0) {
		indexes.push({
			index: [_e1, _e2, _e3],
		})
	}

	_e1 = _e2
	_e2 = _e3

	if (distance > MAX_LINE_DISTANCE) {
		distance = 0
		addCurrentPoint(
			currentPoint,
			distance,
			normal,
			endLeft,
			endRight,
			round,
		)
	}
}

const addLineVertex = (
	vertex: VertexArray<StructPointForLine>,
	point: Point,
	extrude: Point,
	tx: number,
	ty: number,
	// dir: number,
	// linesofar: number,
): number => {
	return vertex.push({
		a_pos: [(point.x << 1) | tx, (point.y << 1) | ty],
		a_data: [
			Math.round(EXTRUDE_SCALE * extrude.x) + 128,
			Math.round(EXTRUDE_SCALE * extrude.y) + 128,
			// ((dir === 0 ? 0 : dir < 0 ? -1 : 1) + 1) |
			// 	(((linesofar * LINE_DISTANCE_SCALE) & 0x3f) << 2),
			// (linesofar * LINE_DISTANCE_SCALE) >> 6,
		],
	})
}

const addPieSliceVertex = (
	currentVertex: Point,
	// distance: number,
	extrude: Point,
	lineTurnsLeft: boolean,
): void => {
	const { vertex, indexes } = array()

	_e3 = addLineVertex(
		vertex,
		currentVertex,
		mult(extrude, lineTurnsLeft ? -1 : 1),
		0,
		lineTurnsLeft ? 1 : 0,
		// 0,
		// distance,
	)

	if (_e1 >= 0 && _e2 >= 0) {
		indexes.push({
			index: [_e1, _e2, _e3],
		})
	}

	if (lineTurnsLeft) {
		_e2 = _e3
	} else {
		_e1 = _e3
	}
}
