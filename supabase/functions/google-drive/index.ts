import { SignJWT, importPKCS8 } from 'https://deno.land/x/jose@v4.15.5/index.ts';

// Garante compatibilidade de tipos
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SUAS CREDENCIAIS RESTAURADAS
const SERVICE_ACCOUNT = {
  "type": "service_account",
  "project_id": "projeto-295101",
  "private_key_id": "6a835dcbd26194220ef7a2c82c565af989fa7226",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDEpZfUggxAaIzC\nwNy5D6SCMggLqeD1IdLYXh8wepn7vSiT9Yw5GHXr8W4jkRNLo2/PpW+Bz7lUIKTo\n0inQzcPpiFRZs9684i/Qrgky4RuCC1j6EBElbVF+CasbNxLSCAQle7kgQtT06QeV\nSvn88YbEe+GM6c3X1DdYeLAkYDkuh1+khY4INdQpgkC8YFAJXzT5KPvudKTwYr2k\nFIQA3JaoS5ty6CcJiJRd6lbjxcm61vmRpcwgFl7tXgPMDdb4djc5R0MxJKItMkV1\nXMF/x3TKjpmz+4rFJ2ZBIcAjx8IJimKp5JMwg6vXrQANHFvmu0mbejvlSUfDIzwU\nRNwMACEdAgMBAAECggEACz/y8e4Xr9abWOfqKK8nqOgeVDZ9f2CWPJkT3TTiWse9\nSsulID4RPvSCqce6rBzXQHCVMr60ukac0JH3YPHol5NcSf5zi2hANobCUXYV2gh2\nqGWjaXn5y8VXU9kAe2IIhLFxi5IvNyyeqbCOoSUbIeH5axOUGlkSan4LC6Wyl8H+\nqItx547OQ+pi7o93N270Hz1tjDKLskcT9RkdGVrUlpGqeuSH/ZmgWUjnfP0vxNFF\nBG2BQkpIlIHxC0HjYcc1q6aXo0iQQpTml9EgO17Wl1Pd8WDFvbSWGY6qqhxE/zBA\n3mvO4vO5vonK9d7+WN5Ebrb71WjOULHZPD4PMa74QQKBgQDq660ksKS6HwDY55Dj\nDSExtSd4f/8dBwlJfEnTvZ8N1T1fc9ZlqX2Gu4Ou17SQnddHMlBaVFG9CPjJ3yub\n1bMcTTyOuXMPmPDlDPDundb0jtb/xMSJzRYjmySNyWj5VsiTgD+FS4LZplKmgzvQ\nTqjN6NxkmtnEC/Te4ERKPEbqwQKBgQDWSrx9AbCgCwqXV0isM+VqTfRQz2TK2vmJ\nuFG7yYBZxOMcqzQKQWT3AWmxfoKefgFl4ozKQAMvn0tT0vnYssaxgbp9cS0bFCIp\nGmD/fKhqpTaRMeSZLzcvsNgw0Joleh5Xm+ZX6OM1SJ3uKBX1satkvVv/lV0dXQF5\ne2dAHVAZXQKBgCpFyH1OsAWx6IQff0nsJen88CJV3gFKL9iiXeKVP5bMpWOUw6K9\nkhH5kiOXOy2+yWtNWXo3rBG5GJOy7fT3ymgwWdJQ+qx21/pPjtdRXcnaHkQeE0O8\nvNwhYb2F3bbob+Vi8Ys54EzsCfleqhe839FVsrsDxmXpxOGKN5+oIxbBAoGAXO46\nQafq9ezz4d/rVyqGUgyOaEEYf9RopS323A4tiECXEUa5obzsUSYetOedM6iHaKzP\ny6Ho/8z/+NEkorIc8rvEqUPcgMLBcbvL1uAzlVQijuLpNPlB4H+7sae1QY1s/SdR\nxEvtxJzCSJa/tzYekuh/rh4TLHm5+vnmM+rCYs0CgYBjJschl7SigZne2Yo9Uo1M\nddIEO0zDjdQdoD0i2wxGvEbi/EKtoEgfqC1LlZMlqFCHuv2wcg1aQhvDBWZFp3TS\n3yet/ozy6B2Y0byQsliZi5VlkOFYh/w6yGaJWuyuGsXlI1tXfuyvsB/Pkvs62FI7\nYpu9O2qYzMaF3ynUw9i7Dg==\n-----END PRIVATE KEY-----\n",
  "client_email": "doutrinacs@projeto-295101.iam.gserviceaccount.com"
};

async function getAccessToken() {
  const privateKeyPEM = SERVICE_ACCOUNT.private_key.replace(/\\n/g, '\n');
  const algorithm = 'RS256';
  const pkcs8 = await importPKCS8(privateKeyPEM, algorithm);
  
  const jwt = await new SignJWT({
    scope: 'https://www.googleapis.com/auth/drive.readonly'
  })
    .setProtectedHeader({ alg: algorithm })
    .setIssuer(SERVICE_ACCOUNT.client_email)
    .setSubject(SERVICE_ACCOUNT.client_email)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(pkcs8);

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenData = await tokenResponse.json();
  if (tokenData.error) throw new Error(`Google OAuth Error: ${tokenData.error}`);
  return tokenData.access_token;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const videoId = url.searchParams.get('videoid');

    // === MODO REDIRECT (Economia de Banda) ===
    // Se o frontend pedir um video, mandamos ele buscar direto no Google
    // Isso evita gastar sua banda no Supabase.
    if (req.method === 'GET' && videoId) {
      const googleDriveUrl = `https://drive.google.com/uc?export=download&confirm=t&id=${videoId}`;
      
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': googleDriveUrl
        }
      });
    }

    // === MODO ADMIN (Listagem de Arquivos) ===
    if (req.method === 'POST') {
      const body = await req.json();
      const { action, folderId } = body;
      
      if (action === 'list') {
        const accessToken = await getAccessToken();
        const targetFolder = folderId || 'root';
        // Query para listar pastas E vídeos, excluindo lixeira
        const q = `'${targetFolder}' in parents and trashed = false and (mimeType = 'application/vnd.google-apps.folder' or mimeType contains 'video/')`;
        
        const params = new URLSearchParams({
          q: q,
          fields: "files(id, name, mimeType, thumbnailLink)",
          orderBy: "folder,name",
          includeItemsFromAllDrives: "true",
          supportsAllDrives: "true",
          pageSize: "100"
        });

        const driveResponse = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const driveData = await driveResponse.json();
        return new Response(JSON.stringify(driveData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }
    }

    return new Response(JSON.stringify({ error: "Ação não reconhecida" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });

  } catch (error: any) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});