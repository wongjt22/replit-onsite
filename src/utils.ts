const FLAT_VAL_URL = "https://bb676fcf-ab50-48cb-96c9-8dd0d467d56e-00-22g00du4q7t0s.spock.replit.dev"

export async function evaluateCode(code: String): Promise<void> {

  const payload = {
    code: code,
    sessionId: "aab9f3ba-7465-4319-820b-555b2e15433d"
  };

  try {
    const response = await fetch(FLAT_VAL_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Request failed', error);
  }
}