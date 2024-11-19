/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addPreSendListener, removePreSendListener, } from "@api/MessageEvents";
import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

const settings = definePluginSettings(
    {
        name: {
            type: OptionType.STRING,
            description: "Whatever you would after the 'Sent via' text",
            default: "a chronic discord user"
        }
    });

export default definePlugin({
    name: "SentVia",
    description: "Automated fingerprint/end text",
    authors: [
        Devs.Samwich,
        { name: "krystalskullofficial", id: 929208515883569182n },
    ],
    dependencies: ["MessageEventsAPI"],
    start() {
        this.preSend = addPreSendListener((channelId, msg) => {
            msg.content = textProcessing(msg.content);
        });
    },
    stop() {
        this.preSend = removePreSendListener((channelId, msg) => {
            msg.content = textProcessing(msg.content);
        });
    },
    settings
});


// text processing injection processor
function textProcessing(input: string) {
    return `${input}\n> Sent via ${settings.store.name}`;
}
