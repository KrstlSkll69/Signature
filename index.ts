/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { MessageEvents } from "@api/index";
import { definePluginSettings } from "@api/Settings";
import { Devs, EquicordDevs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

const settings = definePluginSettings(
    {
        name: {
            type: OptionType.STRING,
            description: "Whatever you would after the 'Sent via' text",
            default: "a chronic discord user"
        }
    });

const handleMessage = ((channelId, msg) => { msg.content = textProcessing(msg.content); });

export default definePlugin({
    name: "SentVia",
    description: "Automated fingerprint/end text",
    authors: [
        Devs.Samwich,
        { name: "krystalskullofficial", id: 929208515883569182n }
    ],
    dependencies: ["MessageEventsAPI"],
    start: () => MessageEvents.addPreSendListener(handleMessage),
    stop: () => MessageEvents.removePreSendListener(handleMessage),
    settings
});

// text processing injection processor
function textProcessing(input: string) {
    return `${input}\n> Sent via ${settings.store.name}`;
}
