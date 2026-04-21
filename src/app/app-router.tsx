import { createHashRouter, RouterProvider } from 'react-router'

import { Menu } from '@/features/menu/ui'
import { DrawLineSimple } from '@/pages/draw-line-simple'
import { DrawLines } from '@/pages/draw-lines'
import { DrawRects } from '@/pages/draw-rects'

const router = createHashRouter([
	{
		path: '/',
		element: <Menu />,
		children: [
			{ index: true, element: <DrawRects /> },
			{ path: 'demo-1', element: <DrawRects /> },
			{ path: 'demo-2', element: <DrawLineSimple /> },
			{ path: 'demo-3', element: <DrawLines /> },
		],
	},
])

export const AppRouter = () => <RouterProvider router={router} />
