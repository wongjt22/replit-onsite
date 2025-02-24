const FLAT_VAL_URL =
  "https://bb676fcf-ab50-48cb-96c9-8dd0d467d56e-00-22g00du4q7t0s.spock.replit.dev";

export async function evaluateCode(code: string): Promise<string | undefined> {
  const payload = {
    code: code,
    sessionId: "aab9f3ba-7465-4319-820b-555b2e15433d",
  };

  console.log("Request code:", code);

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
      return JSON.stringify(response.body);
    }

    const responseData = await response.json();
    console.log("Response data:", responseData);
    const parsedResult = parseEvaluatedCode(responseData);

    return parsedResult;
  } catch (error) {
    console.error("Request failed", error);
  }
}

interface SerializedItem {
  type: "string" | "number" | "boolean" | "object" | "array";
  value: any;
}

interface SerializedResponse {
  root: string;
  serialized: {
    [id: string]: SerializedItem;
  };
}

export const parseEvaluatedCode = (response: SerializedResponse): string => {
  const idToData = new Map<string, any>();

  function parse(id: string): any {
    if (idToData.has(id)) {
      return idToData.get(id);
    }

    const item = response.serialized[id];
    let data: any;

    switch (item.type) {
      case "boolean":
        data = item.value;
        break;
      case "number":
        data = item.value;
        break;
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
