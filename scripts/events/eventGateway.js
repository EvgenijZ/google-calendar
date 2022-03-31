const eventEndpoint =
  "https://623cf2c17efb5abea688e73d.mockapi.io/api/v1/events";

export const getEvents = async () => {
  try {
    const response = await fetch(eventEndpoint);
    if (!response.ok) throw new Error("Failed to get events");
    return await response.json();
  } catch (e) {
    alert(e);
  }
};

export const getEvent = async (id) => {
  try {
    const response = await fetch(`${eventEndpoint}/${id}`);
    if (!response.ok) throw new Error("Failed to get event");
    return await response.json();
  } catch (e) {
    alert(e);
  }
};

export const createEvent = async (eventData) => {
  try {
    const response = await fetch(eventEndpoint, {
      headers: { "Content-Type": "application/json;charset=utf-8" },
      method: "POST",
      body: JSON.stringify(eventData),
    });
    if (!response.ok) throw new Error("Failed to create event");
    return await response.json();
  } catch (e) {
    alert(e);
  }
};

export const updateEvent = async (eventData) => {
  try {
    const response = await fetch(`${eventEndpoint}/${eventData.id}`, {
      headers: { "Content-Type": "application/json" },
      method: "PUT",
      body: JSON.stringify(eventData),
    });
    if (!response.ok) throw new Error("Failed to update event");
    return await response.json();
  } catch (e) {
    alert(e);
  }
};

export const removeEvent = async (id) => {
  try {
    const response = await fetch(`${eventEndpoint}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to remove event");
    return await response.json();
  } catch (e) {
    alert(e);
  }
};
