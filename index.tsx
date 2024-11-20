/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addChatBarButton, ChatBarButton, removeChatBarButton } from "@api/ChatButtons";
import { ApplicationCommandInputType, ApplicationCommandOptionType, findOption, sendBotMessage } from "@api/Commands";
import { findGroupChildrenByChildId, NavContextMenuPatchCallback } from "@api/ContextMenu";
import { MessageEvents } from "@api/index";
import { definePluginSettings, migratePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";
import { Menu, React } from "@webpack/common";


// Big thank you too slientTyping where the chatbar/commands stuff is 'borrowed' from

const settings = definePluginSettings(
    {
        name: {
            type: OptionType.STRING,
            description: "The signature that will be added to the end of your messages",
            default: "a chronic discord user"
        },
        showIcon: {
            type: OptionType.BOOLEAN,
            default: true,
            description: "Show an icon for toggling the plugin in the chat bar",
            restartNeeded: true,
        },
        contextMenu: {
            type: OptionType.BOOLEAN,
            description: "Add option to toggle the functionality in the chat input context menu",
            default: true
        },
        isEnabled: {
            type: OptionType.BOOLEAN,
            description: "Toggle functionality",
            default: true,
        },
    });

const SignatureToggle: ChatBarButton = ({ isMainChat }) => {
    const { isEnabled, showIcon } = settings.use(["isEnabled", "showIcon"]);
    const toggle = () => settings.store.isEnabled = !settings.store.isEnabled;

    if (!isMainChat || !showIcon) return null;

    return (
        <ChatBarButton
            tooltip={isEnabled ? "Disable Signature" : "Enable Signature"}
            onClick={toggle}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M2 4.621a.5.5 0 0 1 .854-.353l6.01 6.01c.126.126.17.31.15.487a2 2 0 1 0 1.751-1.751a.59.59 0 0 1-.487-.15l-6.01-6.01A.5.5 0 0 1 4.62 2H11a9 9 0 0 1 8.468 12.054l2.24 2.239a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.415 0l-2.239-2.239A9 9 0 0 1 2 11z" />
                {isEnabled && <path fill="var(--red-500)" d="M21.71 3.29a1 1 0 0 0-1.42 0l-18 18a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0l18-18a1 1 0 0 0 0-1.42" />}
            </svg>
        </ChatBarButton>
    );
};

const handleMessage = ((channelId, msg) => { if (!settings.store.isEnabled) return ""; return msg.content = textProcessing(msg.content); });

const ChatBarContextCheckbox: NavContextMenuPatchCallback = children => {
    const { isEnabled, contextMenu } = settings.use(["isEnabled", "contextMenu"]);
    if (!contextMenu) return;

    const group = findGroupChildrenByChildId("submit-button", children);

    if (!group) return;

    const idx = group.findIndex(c => c?.props?.id === "submit-button");

    group.splice(idx + 1, 0,
        <Menu.MenuCheckboxItem
            id="vc-Signature"
            label="Enable Signature"
            checked={isEnabled}
            action={() => settings.store.isEnabled = !settings.store.isEnabled}
        />
    );
};


migratePluginSettings("Signature", "SentVia");
export default definePlugin({
    name: "Signature",
    description: "Automated fingerprint/end text",
    authors: [
        // Import from EquicordDev for Equicord
        { name: "krystalskullofficial", id: 929208515883569182n }
    ],
    dependencies: ["MessageEventsAPI", "ChatInputButtonAPI"],

    start: () => {
        if (settings.store.isEnabled) true;
        addChatBarButton("Signature", SignatureToggle);
        MessageEvents.addPreSendListener(handleMessage);
    },
    stop: () => {
        if (settings.store.isEnabled) false;
        removeChatBarButton("Signature");
        MessageEvents.removePreSendListener(handleMessage);

    },

    settings,

    contextMenus: {
        "textarea-context": ChatBarContextCheckbox
    },

    commands: [{
        name: "Signature",
        description: "Toggle whether the Signature 'Signature'",
        inputType: ApplicationCommandInputType.BUILT_IN,
        options: [
            {
                name: "value",
                description: "whether to hide or not that you're typing (default is toggle)",
                required: false,
                type: ApplicationCommandOptionType.BOOLEAN,
            },
        ],
        execute: async (args, ctx) => {
            settings.store.isEnabled = !!findOption(args, "value", !settings.store.isEnabled);
            sendBotMessage(ctx.channel.id, {
                content: settings.store.isEnabled ? "Signature enabled!" : "Signature disabled!",
            });
        },
    }],
});



// text processing injection processor
function textProcessing(input: string) {
    return `${input}\n> ${settings.store.name}`;
}


