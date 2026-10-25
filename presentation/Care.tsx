/* Extract from app.tsx: validate a care-plan file before saving it. */

onChange={(event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (
    file.type !== "application/pdf" &&
    !file.type.startsWith("image/")
  ) {
    toast.warning("Choose a PDF or image");
    return;
  }

  void setPlan(file)
    .then(() => toast.success("Care plan saved to your account"))
    .catch(() => toast.warning("Could not save the care plan"));
}}

/* Extract from firebase-data.ts: save the care plan to account storage. */

export async function uploadCarePlan(uid: string, file: File) {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Choose a file smaller than 10 MB.");
  }

  if (
    file.type !== "application/pdf" &&
    !file.type.startsWith("image/")
  ) {
    throw new Error("Choose a PDF or image.");
  }

  const storagePath =
    `users/${uid}/care-plans/${Date.now()}-${file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_",
    )}`;

  await uploadBytes(ref(requireStorage(), storagePath), file, {
    contentType: file.type,
  });

  const plan = {
    name: file.name,
    storagePath,
    contentType: file.type,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(privateDoc(uid, "carePlan"), plan);
}
