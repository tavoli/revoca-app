# ReVoca: Vocabulary Expansion Web App 

Experience an innovative web application that lets you read books while simultaneously enhancing your vocabulary. 

Here are the standout features:

- Enjoy a hassle-free login process. Simply use any preferred name, sans the need for a password.
- Customize your reading content. Just add the text you'd like to peruse.
- Make reading interactive and educational. Simply click on words to gain instant access to their meanings.
- Manage your learning via the "Configuration Icon". Use it to select specific words you wish to see recurrently throughout your text.
- Avail of cutting-edge AI features by clicking the "Left Paragraph Icon". It can extrapolate concise summaries of your texts, thus facilitating a broader understanding.




https://github.com/tavoli/revoca-app/assets/13285112/f024c356-5dd2-4284-813e-dbab0b7d3c6f




# Features explained

<details>
  <summary>🍿 Simplified Login Process</summary>

---

Upon entering the app, you're free to use any name for login, without the need for a password.

Post-login gives you the liberty to insert the desired text you wish to go through, along with the feature to highlight unfamiliar words.

With each interaction on the app, your actions will be saved and associated with your chosen name.
</details>

<details>
  <summary>🍿 Personalize Your Reading Content</summary>

---

Enhance your reading experience by personalizing your content. Don't hesitate to add your chosen text, a compelling title or an evocative image to accompany your text. 

Rest assured, your custom content is saved securely, ready to be accessed and enjoyed at your convenience.
</details>

<details>
  <summary>🍿 Click here to learn how to use the 'Toggle Word' feature</summary>

---

If you come across any unfamiliar words while reading, simply click on them. If you 'pin' these words, they will be saved for your reference. 

This feature allows you to create a custom list of pinned words which you can repeatedly refer back to while navigating through the current text.

To enable this feature, simply click on the 'Configuration Icon'. Alternatively, the 'Toggle Word' feature will prompt every time you create a new text.

This simple tool is designed to enhance your reading experience and to facilitate faster learning and comprehension. 
</details>

<details>
  <summary>🍿 Paragraph Modifications</summary>

---

### Infuse Keywords - AI Function
This function enables the integration of your pinned words into the text, ensuring that the original meaning is preserved.
### Simplify Text - AI Function
This function will streamline the text, enhancing its readability.
### Break Down Text
This function splits the text at every sentence, making it more succinct and efficient for further modifications.
### Update Text - AI Function
While working with ancient text, this function converts it to modern language, making it as comprehensible as today's vernacular.
</details>

# Identified Issues

- The AI functionality is not displaying comprehensive results when processing an extensive text. This limitation is due to the 10-second execution time cap set by the free serverless functions platform we use. We are currently developing a workaround to address this.
- The login token has a predetermined expiry time, and, currently, our system lacks a refresh function. Consequently, prolonged idle periods may necessitate a new login. We are investigating a suitable solution.
- The app experiences performance issues or may crash when users paste large amounts of text when creating a new document. This problem originates from our text editor, Quill, which creates a new node for each line. We are striving to rectify this issue.

# Potential Enhancements for Future Development

- Develop a feature for refreshing login authentication tokens.
- Incorporate a function to enable the deletion of previously added text.
- Implement a text-to-speech functionality to improve user experience.

# Technology

- Nuxt -> Comprehensive Fullstack Web Development Framework
- CloudFlare -> Advanced S3 hosting solution for text and image files
- Vercel -> Robust platform for Deployment, Serverless Functions and combined Database Hosting (Postgres, Redis)
- Tailwind CSS -> Efficient and customizable framework for Styling
- TypeScript -> Dynamic scripting language for Application Development

# License

MIT 💞
