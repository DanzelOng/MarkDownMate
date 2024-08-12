import createHTTPError from '../utils/httpErrors';
import MarkdownModel from '../models/markdown';

// (GET) retrieve all documents
export async function retrieveDocuments(): Promise<MarkdownModel[]> {
  const response = await fetch('api/v1/markdown/retrieve', {
    method: 'GET',
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    await createHTTPError(response);
  }

  return await response.json();
}

interface NewDocumentDto {
  fileName: string;
}

// (POST) create a new document
export async function createDocument(
  data: NewDocumentDto
): Promise<MarkdownModel> {
  const response = await fetch('api/v1/markdown/create', {
    method: 'POST',
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

interface RenameDocumentDto {
  _id: string;
  fileName: string;
}

// (PATCH) updates name of existing document
export async function renameDocument(
  data: RenameDocumentDto
): Promise<MarkdownModel> {
  const response = await fetch('api/v1/markdown/rename', {
    method: 'PATCH',
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
