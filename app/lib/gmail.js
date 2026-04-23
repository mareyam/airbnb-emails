export async function getEmails(token) {
  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.json();
}
