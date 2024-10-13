import { Link } from 'react-router-dom';

const Breadcrumb = ({ breadcrumbs }) => {
    return (
        <div className="mb-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="lg:text-3xl sm:text-2xl font-bold text-black dark:text-white">
                    {breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : "Page"}
                </h1>

                <nav>
                    <ol className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
                        {breadcrumbs.map((breadcrumb, index) => (
                            <li key={index} className="flex items-center">
                                {index > 0 && <span className="mr-1">/</span>}
                                {index < breadcrumbs.length - 1 ? (
                                    <Link className="font-medium hover:text-primary" to={breadcrumb.path}>
                                        {breadcrumb.name}
                                    </Link>
                                ) : (
                                    <span className="font-medium text-green-700">{breadcrumb.name}</span>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            </div>
        </div>
    );
};

export default Breadcrumb;
