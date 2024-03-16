# ReVoca

A web app where you can read books and accelerate your vocabulary acquisition.

Some notes:

- Login using any name, no password required.
- Add the text you want to read.
- Read the text and click on words you don't know.
- Click on the "Configuration Icon" to toggle the words you want to repeat through the text.
- Click on the "Left Paragraph Icon" to do AI actions on the text, such as summarizing it.


https://github.com/tavoli/revoca-app/assets/13285112/f024c356-5dd2-4284-813e-dbab0b7d3c6f


# Features explained

<details>
  <summary>🍿 Login using any name</summary>

---

Once you enter the app, you can login using any name. No password required.

After you login, you can add the text you want to read and highlight the words you don't know.

For every actions you do, the app will save it and relate it to your name.
</details>

<details>
  <summary>🍿 Add the text you want to read</summary>

---

You can add whatever text you want to read, also add a title and a image to picture the text.

The text will be saved and you can read it whenever you want.
</details>

<details>
  <summary>🍿 Toggle the words you want to infuse</summary>

---

While reading the text, you can click on the words you don't know and they will be saved if you pin them.

That way, you will have a list of pinned words that you can toggle to repeat through the current text.

You can do that by clicking on the "Configuration Icon" or it will appear to you every time you create a new text.
</details>

<details>
  <summary>🍿 Paragraph actions</summary>

---

### Infuse Pins - AI action
This action will infuse the words you pinned to the text, while maintaining the original meaning of the text.
### Simplify Text - AI action
This action will simplify the text, making it easier to read.
### Split Text
This action will split the text at every period, making it shorter and most fast to do the other actions.
### Modernize Text - AI action
While reading a very old text, you can modernize it to make it more understandable as if it was written today.
</details>

# Bugs

- The AI actions are not providing full results when the text is too long - That's because the free tier of the Serverless Functions I'm using has a limit of 10 seconds of execution time. I'm working on a solution for that.
- The login token have a expiration time and I have not implemented a way to refresh it yet. So if you leave the app open for too long, you will have to login again.
- When creating a new text, paste a too long text can make the app crash. I'm working on a solution for that. - That because Quill, the text editor, create a new node for every new line.

# Future Improvements Ideas

- Add a way to refresh the login token.
- Add a way to delete the text you added.
- Add a text-to-speech feature.

# Tech

- Nuxt -> Fullstack Web Framework
- CloudFlare -> S3 hosting for texts and images
- Vercel -> Deployment, Serverless Functions and DB hosting (postgres, redis)
- Tailwind CSS -> Styling
- TypeScript -> Language

# Licsense

MIT 💞
