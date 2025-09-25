import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ShowStatus from "../buttons/ShowStatus";
// import { getCapexRequestsFilterAsync } from "../../services/capexService";
import { IModalProps, INotificationItem } from "../../types/commonTypes";
import { convertCurrencyLabel } from "../../utils/common";
import { deleteNotificationAsync, updateNotificationAsync } from "../../services/notificationService";

interface INotificationContent extends IModalProps {
  data?: INotificationItem[]; // Optional prop to receive data from parent
}

const NotificationContent: React.FC<INotificationContent> = ({ data, closeModal, trigger }) => {
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [notifications, setNotifications] = useState<INotificationItem[]>([]);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [enableOptions, setEnableOptions] = useState<number | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    setNotifications(data || []);
  }, [data]);

  const handleFilterChange = (newFilter: 'all' | 'read' | 'unread') => {
    setFilter(newFilter);
  };

  const handleDeleteNotifications = async (index: number) => {
    try {
      console.log(index);
      setEnableOptions(null);
      await deleteNotificationAsync([filteredNotifications[index].id])
      console.log("deleted");
      trigger();
    } catch (err) {

    }
  }

  const handleNotificationClick = async (notification: INotificationItem) => {
    // Mark as read when clicked
    // if (!notification.isRead) {
    //   markAsRead(notification.id);
    // }
    notification.isRead = true;
    await updateNotificationAsync(notification.id, notification)
    // Navigate to the capex request detail page
    navigate(`/${notification.notificationType}/${notification.uniqueId}`);
    closeModal()
  };

  useEffect(() => {
    const handleScroll = () => {
      if (openDropdown !== null) {
        setOpenDropdown(null);
      }
    };

    const tableContainer = tableContainerRef.current;
    if (tableContainer) {
      tableContainer.addEventListener('scroll', handleScroll);
    }
    window.addEventListener('scroll', handleScroll);

    return () => {
      if (tableContainer) {
        tableContainer.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [openDropdown]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'read') return notification.isRead === true;
    if (filter === 'unread') return notification.isRead === false;
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-50 to-white" style={{ minWidth: "450px" }}>
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-500">Stay updated with your latest activities</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => handleFilterChange('all')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${filter === 'all'
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange('unread')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${filter === 'unread'
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Unread
          </button>
          <button
            onClick={() => handleFilterChange('read')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${filter === 'read'
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Read
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-grow overflow-y-auto" ref={tableContainerRef} onClick={() => {
        enableOptions != null && setEnableOptions(null);
      }}>
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              You're all caught up! New notifications will appear here when they arrive.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-3">
            {filteredNotifications.map((notification, i) => (
              <div
                key={notification.id}
                className={`group relative bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer ${!notification.isRead ? 'ring-2 ring-blue-100 bg-blue-50/30' : ''
                  }`}
                onClick={() => { enableOptions == null && handleNotificationClick(notification) }}
              >
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    {/* Notification Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${!notification.isRead
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-500'
                      }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                              {notification.title}
                            </h4>
                          </div>

                          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              {notification.description && notification.description.length > 150
                                ? `${notification.description.slice(0, 150)}...`
                                : notification.description}
                            </span>
                            {/* <span>•</span>
                            <span>{notification.status}</span> */}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-xs text-gray-500">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </span>
                              {/* <span className="text-xs font-medium text-green-600">
                                {convertCurrencyLabel(notification.currency || "USD")} {notification.estimatedBudget?.toLocaleString()}
                              </span> */}
                            </div>
                            <div className="flex items-center space-x-2">
                              <ShowStatus status={Number(notification.status)} type="rfps" />
                            </div>
                          </div>
                        </div>

                        {/* Options Menu */}
                        <div className="flex-shrink-0 ml-2">
                          <button
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            onClick={(e) => {
                              setEnableOptions(i);
                              e.stopPropagation();
                            }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>

                          {/* Dropdown Menu */}
                          <div className={`absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 ${i === enableOptions ? "block" : "hidden"
                            }`}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotifications(i);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationContent;