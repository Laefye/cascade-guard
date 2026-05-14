import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, Client, Events, GatewayIntentBits, MessageFlags, REST, Routes, SlashCommandBuilder, TextChannel } from "discord.js";
import { config } from "./config.js";
import { loadKeyPair, loadPublicKeyFromBase64, showPublicKey } from "./keypair.js";
import { Api } from "./api.js";
import { defaultSignatureOptions, sign, type VerificationAsk } from "./requests.js";
import { Web, WebApiResponseError } from "./services/web.js";
import jwt from "jsonwebtoken";

const verifyMessage = new SlashCommandBuilder().setName("send_verify_message").setDescription("Sends a verification message to the channel");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const rest = new REST().setToken(config.token);
const keypair = await loadKeyPair(config.keypairDir);
console.log("Public Key:", showPublicKey(keypair.publicKey));
const api = new Api(loadPublicKeyFromBase64(config.webPublicKey));

const webApi = new Web(config.webEndpoint, async () => {
    return jwt.sign({}, keypair.privateKey, { algorithm: "ES256", expiresIn: "5m" });
});


client.once(Events.ClientReady, (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName === "send_verify_message") {
        if (interaction.user.id !== config.adminUserId) {
            await interaction.reply({ content: "You don't have permission to use this command.", flags: MessageFlags.Ephemeral });
            return;
        }
        await interaction.reply({ content: "Verification message sent!", flags: MessageFlags.Ephemeral });
        if (!interaction.channel) {
            console.error("Interaction has no channel!");
            return;
        }
        const channel = await interaction.channel;
        if (!(channel instanceof TextChannel)) {
            return;
        }
        const button = new ButtonBuilder()
            .setLabel('Пройти верификацию')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('verify_button');

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
        const attachment = new AttachmentBuilder('./assets/verification.png');

        channel.send({ components: [row], files: [attachment] });
    }

    if (interaction.isButton() && interaction.customId === 'verify_button') {
        let verificationId;

        try {
            verificationId = await webApi.createVerificationRequest(interaction.user.id, interaction.user.displayName, interaction.user.avatarURL() || null);
        } catch (error) {
            console.error("Failed to create verification request:", error);
            await interaction.reply({ content: "Случилось депрессия <:fir_sad:1384540465109401704>", flags: MessageFlags.Ephemeral });
            return;
        }

        const button = new ButtonBuilder()
            .setLabel('Перейти')
            .setStyle(ButtonStyle.Link)
            .setURL(webApi.getVerifyEndpoint(verificationId.verificationId));

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

        const reply = await interaction.reply({ content: "Вам нужно пройти проверку в браузере в течение минуты!", components: [row], flags: MessageFlags.Ephemeral });
        setTimeout(() => {
            reply.delete().catch(console.error);
        }, 1000 * 15);
    }
});

api.bus.on('verified', async (userId: string) => {
    try {
        const guild = await client.guilds.fetch(config.guildId);
        const member = await guild.members.fetch(userId);
        await member.roles.add(config.roleId);
        console.log(`Assigned role to user ${userId}`);
    } catch (error) {
        console.error(`Failed to assign role to user ${userId}:`, error);
    }
});

async function main() {
  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
        body: [
            verifyMessage.toJSON(),
        ]
    });
    console.log("Successfully refreshed application (/) commands.");
    console.log("Logging in...");
    await client.login(config.token);
  } catch (error) {
    console.error(error);
  }
}

async function runApi() {
    const port = config.port;
    api.listen(port);
}

main();
runApi();
