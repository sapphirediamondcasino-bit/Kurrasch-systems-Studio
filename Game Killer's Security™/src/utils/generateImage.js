/**
 * Welcome Image Generator
 * Creates custom welcome images for new members
 */

const Canvas = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');

const background = "https://media.discordapp.net/attachments/541695902885347328/1038943656800964628/Gamekillers.png";

const dim = {
    height: 675,
    width: 1200,
    margin: 50
};

const av = {
    size: 256,
    x: 480,
    y: 170
};

/**
 * Generate welcome image for member
 */
const generateImage = async (member) => {
    try {
        let username = member.user.username;
        let discrim = member.user.discriminator;
        
        // Discord.js v14 no longer uses discriminators for most users
        let displayName = discrim && discrim !== '0' ? `${username}#${discrim}` : username;
        
        let avatarURL = member.user.displayAvatarURL({ 
            extension: 'png', 
            size: av.size 
        });

        const canvas = Canvas.createCanvas(dim.width, dim.height);
        const ctx = canvas.getContext('2d');

        // Draw in the background
        const backimg = await Canvas.loadImage(background);
        ctx.drawImage(backimg, 0, 0);

        // Draw black tinted box
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(dim.margin, dim.margin, dim.width - 2 * dim.margin, dim.height - 2 * dim.margin);

        // Draw avatar with circular mask
        const avimg = await Canvas.loadImage(avatarURL);
        ctx.save();
        
        ctx.beginPath();
        ctx.arc(av.x + av.size / 2, av.y + av.size / 2, av.size / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(avimg, av.x, av.y);
        ctx.restore();

        // Add border around avatar
        ctx.strokeStyle = '#00d9ff';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(av.x + av.size / 2, av.y + av.size / 2, av.size / 2, 0, Math.PI * 2);
        ctx.stroke();

        // Write in text
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';

        // Draw in Welcome
        ctx.font = '50px sans-serif';
        ctx.fillText('Welcome to Game Killers Zone!', dim.width / 2, dim.margin + 70);

        // Draw in the username
        ctx.font = '60px sans-serif';
        ctx.fillText(displayName, dim.width / 2, dim.height - dim.margin - 125);

        // Draw member count
        ctx.font = '40px sans-serif';
        ctx.fillText(`Member #${member.guild.memberCount}`, dim.width / 2, dim.height - dim.margin - 50);

        const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { 
            name: 'welcome.png' 
        });
        
        return attachment;

    } catch (error) {
        console.error('Error generating welcome image:', error);
        return null;
    }
};

module.exports = generateImage;