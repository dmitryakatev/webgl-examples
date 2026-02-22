export type Point = {
	x: number
	y: number
}

export const equals = (p1: Point, p2: Point): boolean => {
	return p1.x === p2.x && p1.y === p2.y
}

export const clone = (p: Point): Point => {
	return {
		x: p.x,
		y: p.y,
	}
}

export const add = (p1: Point, p2: Point): Point => {
	return {
		x: p1.x + p2.x,
		y: p1.y + p2.y,
	}
}

export const sub = (p1: Point, p2: Point): Point => {
	return {
		x: p1.x - p2.x,
		y: p1.y - p2.y,
	}
}

export const mult = (p: Point, k: number): Point => {
	return {
		x: p.x * k,
		y: p.y * k,
	}
}

export const div = (p: Point, k: number): Point => {
	return {
		x: p.x / k,
		y: p.y / k,
	}
}

export const mag = (p: Point) => {
	return Math.sqrt(p.x * p.x + p.y * p.y)
}

export const dist = (p1: Point, p2: Point) => {
	const dx = p2.x - p1.x
	const dy = p2.y - p1.y

	return Math.sqrt(dx * dx + dy * dy)
}

export const unit = (p: Point) => {
	return div(p, mag(p))
}

export const perp = (p: Point) => {
	return {
		x: -p.y,
		y: p.x,
	}
}

// mag perp mult clone
