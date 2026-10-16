# Before You Buy: free setup on Cloudflare Pages

Everything here is free and allowed for a business that earns money.

1. Put this folder's files on GitHub. The repository must have index.html at the top.
2. Go to dash.cloudflare.com and sign up free.
3. Go to Workers & Pages > Create > Pages > Connect to Git, then pick your repository.
4. Settings: Framework preset = None, Build command = (leave empty), Build output directory = /
   If your files are inside a folder on GitHub, put that folder name in Root directory.
5. Save and Deploy. Your site is at yourname.pages.dev.
6. Settings > Variables and Secrets > add GEMINI_API_KEY (free key from aistudio.google.com), then Deployments > Retry deployment.
