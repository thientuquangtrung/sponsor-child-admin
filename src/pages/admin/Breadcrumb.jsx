import { Link } from 'react-router-dom';

const Breadcrumb = ({ pageName }) => {
    return (
        <div className="mb-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
                    {pageName}
                </h2>

                <nav>
                    <ol className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
                        <li>
                            <Link className="font-medium text-body hover:text-primary" to="/">
                                Dashboard
                            </Link>
                        </li>
                        <li className="text-body">/</li>
                        <li className="font-medium text-green-700 truncate max-w-[120px] sm:max-w-none">
                            {pageName}
                        </li>
                    </ol>
                </nav>
            </div>
        </div>
    );
};

export default Breadcrumb;