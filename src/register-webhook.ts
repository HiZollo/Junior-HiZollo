/*
 * 
 * Copyright 2022 HiZollo Dev Team <https://github.com/hizollo>
 * 
 * This file is a part of Junior HiZollo.
 * 
 * Junior HiZollo is free software: you can redistribute it and/or 
 * modify it under the terms of the GNU General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Junior HiZollo is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Junior HiZollo. If not, see <https://www.gnu.org/licenses/>.
 */

import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';
import { APIWebhook } from 'discord-api-types/v10'
import 'dotenv/config';

(async () => {
	if (!process.env.TOKEN) {
		console.error("Please configure your bot token in .env before registering webhook");
		process.exit(1);
	}

	const rest = new REST({ version: '10' }).setToken(process.env.TOKEN)
	const channelId = process.argv[2];

	if (!channelId) {
		console.error("Please provide the id of target channel");
		process.exit(1);
	}

	const name = process.argv[3] ?? "My Sweet Webhook";

	try {
		const res = await rest.post(Routes.channelWebhooks(channelId), {
			body: { name }
		}) as APIWebhook;

		console.log(`Name: ${res.name}`);
		console.log(`ID: ${res.id}`);
		console.log(`Webhook: ${res.token}`);
	} catch(err) {
		console.error(err);
		process.exit(1);
	}

})()
