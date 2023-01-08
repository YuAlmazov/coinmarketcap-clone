import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'prisma/prisma';

const removeCoin: NextApiHandler = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {
	const { coinId } = req.body;
	const { userId } = req.query;

	const watchlist = await prisma.watchlist.findFirst({
		where: {
			userId: userId as string,
			isMain: true,
		},
	});

	if (!watchlist) {
		return res.status(404).send({ error: `Couldn't find watchlist` });
	}

	await prisma.watchlist.update({
		where: {
			id: watchlist.id,
		},
		data: {
			coinIds: {
				set: watchlist.coinIds.filter((id) => id !== coinId),
			},
		},
	});

	res.json(watchlist);
};
export default removeCoin;