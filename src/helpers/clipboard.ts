/**
 * Copies the JSON into clipboard
 * @param jsonString - json data as a string
 */
export function createJsonCopyLink(jsonString: string) {
    navigator.clipboard.writeText(jsonString)
        .then(() => {
            console.log('JSON copied to clipboard');
        })
        .catch((err) => {
            console.error('Failed to copy JSON: ', err);
        });
}