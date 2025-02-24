const FLAT_VAL_URL =
  "https://bb676fcf-ab50-48cb-96c9-8dd0d467d56e-00-22g00du4q7t0s.spock.replit.dev";

// Keep track of sessions per tab
const sessions = new Map<string, string>();

export function getSessionId(tabId: string) {
  console.log('Getting session for tab:', tabId, 'Current sessions:', sessions);
  if (!sessions.has(tabId)) {
    const newSessionId = crypto.randomUUID();
    console.log('Creating new session for tab:', tabId, 'Session:', newSessionId);
    sessions.set(tabId, newSessionId);
  }
  return sessions.get(tabId)!;
}

export function resetSessionId(tabId: string) {
  const newSessionId = crypto.randomUUID();
  console.log('Resetting session for tab:', tabId, 'New session:', newSessionId);
  sessions.set(tabId, newSessionId);
  return newSessionId;
}

export async function evaluateCode(code: string, tabId: string): Promise<unknown> {
  const sessionId = getSessionId(tabId);
  console.log('Evaluating code for tab:', tabId, 'Session:', sessionId);

  const payload = {
    code: code,
    sessionId: sessionId,
  };

  try {
    const response = await fetch(FLAT_VAL_URL + "/eval", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Unknown error occurred');
    }

    const responseData = await response.json();
    const parsedResult = parseEvaluatedCode(responseData);

    return parsedResult;
  } catch (error) {
    console.error("Request failed", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Unknown error occurred');
  }
}

interface SerializedItem {
  type: "string" | "number" | "boolean" | "undefined" | "null" | "object" | "array";
  value: unknown;
}

interface SerializedResponse {
  root: string;
  serialized: {
    [id: string]: SerializedItem;
  };
}

export const parseEvaluatedCode = (response: SerializedResponse): unknown => {
  const idToData = new Map<string, unknown>();

  function parse(id: string): unknown {
    if (idToData.has(id)) {
      return idToData.get(id);
    }

    const item = response.serialized[id];
    let data: unknown;

    switch (item.type) {
      case "null":
        data = null;
        break;
      case "undefined":
        data = undefined;
        break;
      case "boolean":
      case "number":
      case "string":
        data = item.value;
        break;
      case "object":
        data = {};
        idToData.set(id, data);

        for (const pair of item.value) {
          const key = parse(pair.key);
          const value = parse(pair.value);
          data[key] = value;
        }
        break;
      case "array":
        data = [];
        idToData.set(id, data);

        for (const elementId of item.value) {
          data.push(parse(elementId));
        }
        break;
      default:
        throw new Error(`Unknown type: ${item.type}`);
    }

    idToData.set(id, data);
    return data;
  }

  return parse(response.root);
};
