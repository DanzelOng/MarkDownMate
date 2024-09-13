import createHTTPError from '../utils/httpErrors';
import MarkdownModel from '../models/markdown';

const serverURL = import.meta.env.VITE_SERVER_URL;

// (GET) retrieve all documents
export async function retrieveDocuments(): Promise<MarkdownModel[]> {
  const response = await fetch(`${serverURL}/api/v1/markdown/retrieve`, {
    method: 'GET',
    credentials: 'include',
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    await createHTTPError(response);
  }

  return await response.json();
}

interface DocumentResponse {
  fileName: string;
  blob: Blob;
}

// (GET) downloads a document
export async function downloadDocument(id: string): Promise<DocumentResponse> {
  const response = await fetch(`${serverURL}/api/v1/markdown/download/${id}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await createHTTPError(response);
  }

  const contentDispostion = response.headers.get(
    'Content-Disposition'
  ) as string;

  const match = contentDispostion.match(/filename="(.+)"/) as RegExpMatchArray;

  const blob = await response.blob();

  return { fileName: match[1], blob };
}

interface NewDocumentDto {
  fileName: string;
}

// (POST) create a new document
export async function createDocument(
  data: NewDocumentDto
): Promise<MarkdownModel> {
  const response = await fetch(`${serverURL}/api/v1/markdown/create`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await createHTTPError(response);
  }

  return await response.json();
}

// (POST) uploads a document to the server
export async function uploadFile(data: FormData): Promise<MarkdownModel> {
  const response = await fetch(`${serverURL}/api/v1/markdown/upload`, {
    method: 'POST',
    credentials: 'include',
    body: data,
  });

  if (!response.ok) {
    await createHTTPError(response);
  }

  return await response.json();
}

interface RenameDocumentDto {
  _id: string;
  fileName: string;
}

// (PATCH) updates name of existing document
export async function renameDocument(
  data: RenameDocumentDto
): Promise<MarkdownModel> {
  const response = await fetch(`${serverURL}/api/v1/markdown/rename`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await createHTTPError(response);
  }

  return await response.json();
}

// (PUT) saves existing document contents
export async function updateDocument(
  data: MarkdownModel
): Promise<MarkdownModel> {
  const response = await fetch(`${serverURL}/api/v1/markdown/save`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await createHTTPError(response);
  }

  return await response.json();
}

// (DELETE) deletes an existing document
export async function deleteDocument(id: string) {
  const response = await fetch(`${serverURL}/api/v1/markdown/delete/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    await createHTTPError(response);
  }
}
