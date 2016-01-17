export interface Card {
    _id?: string,
    userId?: string,
    bookId: string,
    note: string,
    text: string,
    position: number,
    context: string
};
