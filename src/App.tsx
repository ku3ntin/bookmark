import React, { useReducer, useState } from 'react';
import './App.css';
import { BookmarkModel } from './bookmark.model';

const App = () => {
    const [listBookMarks, setListBookMarks] = useState<BookmarkModel[]>([]);
    const [, forceUpdate] = useReducer((x) => x + 1, 0);
    const validUrlVimeoOrFlickr = new RegExp(
        '^(http://www.|https://www.|http://|https://|www.)?(vimeo.com|flickr.com).*$',
    );

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
        const formData = new FormData(event.currentTarget);
        // Reset field.
        event.currentTarget.reset();
        event.preventDefault();
        const formObject = Object.fromEntries(formData.entries());
        const url = formObject.url.toString();
        if (validUrlVimeoOrFlickr.test(url)) {
            try {
                const response = await fetch(`https://noembed.com/embed?url=${url}`);
                const responseData = await response.json();
                responseData.error
                    ? alert(responseData.error)
                    : listBookMarks.unshift({ ...responseData, added_date: new Date() });
                forceUpdate();
            } catch (e) {
                alert(e);
            }
        } else {
            alert("Erreur dans l'url");
        }
    };

    const deleteBookMarks = (index: number) => {
        const array = [...listBookMarks];
        if (index > -1) {
            array.splice(index, 1);
            setListBookMarks(array);
        }
    };

    function secondsToTime(e = 0) {
        const h = Math.floor(e / 3600)
                .toString()
                .padStart(2, '0'),
            m = Math.floor((e % 3600) / 60)
                .toString()
                .padStart(2, '0'),
            s = Math.floor(e % 60)
                .toString()
                .padStart(2, '0');

        return h + ':' + m + ':' + s;
    }

    function dateToStringFR(date: Date) {
        const dateParse = new Date(date);
        const dateToString = dateParse.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        return `le ${dateToString}`;
    }

    function dateFormatDistanceToNow(date: Date) {
        const dateNow = new Date();
        const dateParse = new Date(date);
        const timeDifference = dateNow.getTime() - dateParse.getTime();

        const Seconds = Math.floor(timeDifference / 1000);

        const h = Math.floor(Seconds / 3600);
        const m = Math.floor((Seconds % 3600) / 60);
        const s = Math.floor((Seconds % 3600) % 60);

        const hDisplay = h > 0 ? h + (h == 1 ? ' heure, ' : ' heures, ') : '';
        const mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '';
        const sDisplay = s >= 0 ? s + (s == 1 ? ' seconde' : ' secondes') : '';
        return `Il y a ${hDisplay + mDisplay + sDisplay}`;
    }

    return (
        <div className="App">
            <div className="form">
                <form onSubmit={handleSubmit}>
                    <label>
                        URL (Vimeo ou Flickr) :<input type="text" name="url"></input>
                    </label>
                    <button className="btn" type="submit">
                        <span className="submit">Envoyer</span>
                    </button>
                </form>
            </div>

            <div className="list">
                {listBookMarks.length > 0 &&
                    listBookMarks.map((bookMarks, index) => (
                        <div id="container" key={index}>
                            <div className="bookmark-details">
                                <h1>{bookMarks.title}</h1>
                                <ul>
                                    <li>
                                        <strong>Auteur : </strong>
                                        {bookMarks.author_name}
                                    </li>
                                    <li>
                                        <strong>URL : </strong>
                                        <a href={bookMarks.url}>{bookMarks.url}</a>
                                    </li>

                                    <li>
                                        <strong>Date d&apos;ajout: </strong>
                                        {dateFormatDistanceToNow(bookMarks.added_date)}
                                    </li>
                                    {bookMarks.upload_date && (
                                        <li>
                                            <strong>Date publication: </strong>
                                            {dateToStringFR(bookMarks.upload_date)}
                                        </li>
                                    )}
                                    {bookMarks.provider_name === 'Vimeo' && (
                                        <li>
                                            <strong>Durée: </strong>
                                            {secondsToTime(bookMarks.duration)}
                                        </li>
                                    )}
                                    {bookMarks.provider_name === 'Flickr' && (
                                        <li>
                                            <strong>Largeur x Hauteur: </strong>
                                            {bookMarks.width} X {bookMarks.height}
                                        </li>
                                    )}
                                </ul>

                                <div className="control">
                                    <button className="btn" onClick={() => deleteBookMarks(index)}>
                                        <span className="delete">Supprimer</span>
                                    </button>
                                </div>
                            </div>

                            <div className="bookmark-image">
                                <div dangerouslySetInnerHTML={{ __html: bookMarks.html }}></div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default App;
